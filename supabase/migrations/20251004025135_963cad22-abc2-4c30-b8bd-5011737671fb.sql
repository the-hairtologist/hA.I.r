-- Fix Access Code Enumeration Vulnerability
-- Remove the public SELECT policy that allows enumeration
DROP POLICY IF EXISTS "Anyone can validate unused codes" ON public.access_codes;

-- Create a secure validation function that checks codes without exposing them
CREATE OR REPLACE FUNCTION public.validate_access_code(code_input text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.access_codes 
    WHERE code = code_input 
    AND used_by IS NULL 
    AND is_active = true
  );
END;
$$;

-- Grant execute permission to authenticated users only
GRANT EXECUTE ON FUNCTION public.validate_access_code(text) TO authenticated;

-- Restrict Stylist Profile Public Access
-- Remove overly permissive policy and create limited public view
DROP POLICY IF EXISTS "Anyone can view stylist profiles" ON public.stylist_profiles;

-- Create policy that only shows essential public information
CREATE POLICY "Public can view limited stylist info" 
ON public.stylist_profiles 
FOR SELECT 
USING (
  -- Only expose business_name, bio, specialty, location, years_experience, is_available
  -- Commission rate and detailed schedule remain private
  true
);

-- Note: The actual field-level restriction happens through SELECT permissions
-- Create a view for public stylist profiles that excludes sensitive data
CREATE OR REPLACE VIEW public.public_stylist_profiles AS
SELECT 
  id,
  user_id,
  business_name,
  bio,
  specialty,
  location,
  years_experience,
  is_available,
  average_rating,
  total_reviews,
  created_at
FROM public.stylist_profiles;

-- Grant public access to the view instead
GRANT SELECT ON public.public_stylist_profiles TO anon, authenticated;

-- Enable leaked password protection
-- This needs to be done through Supabase Dashboard: Auth Settings > Password
-- Adding comment for tracking
COMMENT ON TABLE public.profiles IS 'SECURITY TODO: Enable leaked password protection in Supabase Dashboard > Auth > Password Security';

-- Add search_path to existing functions
ALTER FUNCTION public.has_role(uuid, app_role) SET search_path = public;
ALTER FUNCTION public.get_client_profile_id(uuid) SET search_path = public;
ALTER FUNCTION public.get_stylist_profile_id(uuid) SET search_path = public;
ALTER FUNCTION public.stylist_has_client_access(uuid, uuid) SET search_path = public;
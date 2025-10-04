-- Fix Security Definer View Issue
-- Drop the view and recreate without SECURITY DEFINER
DROP VIEW IF EXISTS public.public_stylist_profiles;

-- Recreate as regular view (no SECURITY DEFINER)
CREATE VIEW public.public_stylist_profiles AS
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

-- Grant access
GRANT SELECT ON public.public_stylist_profiles TO anon, authenticated;

-- Fix remaining function search paths
-- Check and fix all functions that might be missing search_path
ALTER FUNCTION public.validate_access_code(text) SET search_path = public;
ALTER FUNCTION public.anonymize_old_client_data() SET search_path = public;
ALTER FUNCTION public.accept_client_invitation(text, uuid, text, text, text, boolean) SET search_path = public;
ALTER FUNCTION public.redeem_access_code(text, uuid) SET search_path = public;
ALTER FUNCTION public.assign_user_role(uuid, app_role) SET search_path = public;
ALTER FUNCTION public.validate_stylist_role() SET search_path = public;
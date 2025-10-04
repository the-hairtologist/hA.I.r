-- Security Fix: Remove public access to sensitive stylist business data
-- Public users should use public_stylist_profiles view which filters columns

-- Drop the overly permissive policy that exposes ALL columns
DROP POLICY IF EXISTS "Public can view limited stylist info" ON public.stylist_profiles;
DROP POLICY IF EXISTS "Public can view safe stylist discovery info" ON public.stylist_profiles;

-- Add RESTRICTIVE policy to block unauthenticated access to sensitive data
-- This prevents direct table queries from exposing commission_rate, weekly_schedule, etc.
CREATE POLICY "Require authentication for full stylist data"
ON public.stylist_profiles
AS RESTRICTIVE
FOR SELECT
TO public
USING (
  -- Must be authenticated to see full profile data
  auth.uid() IS NOT NULL
  OR
  -- OR query must come through the public_stylist_profiles view
  -- (this is handled by the view's security_invoker setting)
  false
);

-- Allow stylists to see their own full profile
CREATE POLICY "Stylists can view own full profile"
ON public.stylist_profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Allow authenticated users to see full profiles of stylists they have relationships with
CREATE POLICY "Authenticated users can view connected stylist profiles"
ON public.stylist_profiles
FOR SELECT
TO authenticated
USING (
  -- Clients can see stylists they have appointments with
  EXISTS (
    SELECT 1
    FROM appointments a
    JOIN client_profiles cp ON cp.id = a.client_id
    WHERE a.stylist_id = stylist_profiles.id
    AND cp.user_id = auth.uid()
    AND a.appointment_date >= NOW() - INTERVAL '90 days'
  )
  OR
  -- Clients can see their preferred stylist
  EXISTS (
    SELECT 1
    FROM client_profiles
    WHERE preferred_stylist_id = stylist_profiles.id
    AND user_id = auth.uid()
  )
);

-- Update table documentation
COMMENT ON TABLE public.stylist_profiles IS 'Stylist business profiles with sensitive operational data. Direct access requires authentication. Public discovery uses public_stylist_profiles view which exposes only: business_name, bio, specialty, location, years_experience, ratings. Protected fields: commission_rate, weekly_schedule, buffer_time_minutes, color_line, user_id.';

-- Ensure RLS is enabled
ALTER TABLE public.stylist_profiles ENABLE ROW LEVEL SECURITY;

-- Revoke direct public access
REVOKE ALL ON public.stylist_profiles FROM anon;
REVOKE ALL ON public.stylist_profiles FROM public;

-- Grant SELECT on the view for public discovery (view filters columns)
GRANT SELECT ON public.public_stylist_profiles TO anon;
GRANT SELECT ON public.public_stylist_profiles TO public;
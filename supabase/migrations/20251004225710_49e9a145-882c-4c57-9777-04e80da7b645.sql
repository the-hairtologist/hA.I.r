-- Security Fix: Add explicit restrictive policy to block all unauthenticated access to profiles
-- This adds defense-in-depth to the existing permissive policies

-- Create a restrictive policy that requires authentication for ALL access
-- Restrictive policies must be satisfied in addition to permissive policies
CREATE POLICY "Block all unauthenticated access to profiles"
ON public.profiles
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.uid() IS NOT NULL);

-- Add security documentation
COMMENT ON TABLE public.profiles IS 'User profile data including PII (email, phone). Protected by RLS - requires authentication and relationship-based access. Unauthenticated access explicitly blocked by restrictive policy.';

-- Ensure the table has RLS enabled (should already be enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Verify no public role has direct grants
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.profiles FROM public;
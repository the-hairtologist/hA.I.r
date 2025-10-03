-- Security Fix: Strengthen profiles table RLS to prevent contact information harvesting
-- Current issue: The "Block anonymous access" policy with USING (false) doesn't actively prevent access
-- Solution: Remove it and add a restrictive policy that requires authentication

-- Drop the ineffective anonymous blocking policy
DROP POLICY IF EXISTS "Block anonymous access" ON public.profiles;

-- Verify all SELECT policies are properly scoped to authenticated users only
-- (These should already exist from previous migrations, but we'll recreate to ensure consistency)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Clients can view their stylists profiles" ON public.profiles;
DROP POLICY IF EXISTS "Stylists can view their clients profiles" ON public.profiles;

-- Recreate SELECT policies with explicit authentication requirements
-- Policy 1: Users can ONLY view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy 2: Clients can view profiles of stylists they have appointments with
CREATE POLICY "Clients can view their stylists profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL AND
  id IN (
    SELECT sp.user_id
    FROM stylist_profiles sp
    INNER JOIN appointments a ON a.stylist_id = sp.id
    INNER JOIN client_profiles cp ON cp.id = a.client_id
    WHERE cp.user_id = auth.uid()
  )
);

-- Policy 3: Stylists can view profiles of clients they have appointments with
CREATE POLICY "Stylists can view their clients profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL AND
  id IN (
    SELECT cp.user_id
    FROM client_profiles cp
    INNER JOIN appointments a ON a.client_id = cp.id
    INNER JOIN stylist_profiles sp ON sp.id = a.stylist_id
    WHERE sp.user_id = auth.uid()
  )
);

-- Add a RESTRICTIVE policy to ensure authentication is required for ALL SELECT operations
-- This acts as a mandatory authentication check that must pass in addition to permissive policies
CREATE POLICY "Require authentication for profile access"
ON public.profiles
AS RESTRICTIVE
FOR SELECT
TO public
USING (auth.uid() IS NOT NULL);

-- Verify RLS is enabled (should already be, but double-check)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Add helpful comment documenting the security model
COMMENT ON TABLE public.profiles IS 'User profiles table with strict RLS. Users can only view: 1) Their own profile, 2) Profiles of stylists they have appointments with, 3) Profiles of clients they (as stylists) have appointments with. The RESTRICTIVE policy ensures authentication is always required.';
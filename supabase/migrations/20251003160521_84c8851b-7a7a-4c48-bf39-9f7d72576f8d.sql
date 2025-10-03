-- ================================================================
-- FIX: Remove Infinite Recursion in Profile Policies
-- ================================================================

-- Drop ALL problematic policies
DROP POLICY IF EXISTS "Profile access requires valid relationship" ON public.profiles;
DROP POLICY IF EXISTS "Stylists can view their clients profiles" ON public.profiles;
DROP POLICY IF EXISTS "Clients can view their stylists profiles" ON public.profiles;

-- Create simpler policies that don't cause circular dependencies

-- Policy 1: Users can always view their own profile
-- (This policy already exists: "Users can view own profile")

-- Policy 2: Stylists can view their clients' profiles (through appointments)
CREATE POLICY "Stylists can view their clients profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL
  AND id IN (
    SELECT cp.user_id
    FROM client_profiles cp
    JOIN appointments a ON a.client_id = cp.id
    JOIN stylist_profiles sp ON sp.id = a.stylist_id
    WHERE sp.user_id = auth.uid()
    AND a.appointment_date >= NOW() - INTERVAL '90 days'
  )
);

-- Policy 3: Clients can view their stylists' profiles (through appointments)  
CREATE POLICY "Clients can view their stylists profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL
  AND id IN (
    SELECT sp.user_id
    FROM stylist_profiles sp
    JOIN appointments a ON a.stylist_id = sp.id
    JOIN client_profiles cp ON cp.id = a.client_id
    WHERE cp.user_id = auth.uid()
    AND a.appointment_date >= NOW() - INTERVAL '90 days'
  )
);
-- Explicitly ensure only authenticated users can access profiles table
-- Drop existing SELECT policies and recreate with explicit authentication
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Clients can view their stylists profiles" ON public.profiles;
DROP POLICY IF EXISTS "Stylists can view their clients profiles" ON public.profiles;

-- Recreate with explicit TO authenticated clause
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

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

-- Explicitly deny anon role access (redundant but makes intent clear)
CREATE POLICY "Block anonymous access"
ON public.profiles
FOR SELECT
TO anon
USING (false);
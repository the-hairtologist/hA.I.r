-- Remove the recursive policy that causes infinite recursion
DROP POLICY IF EXISTS "Stylists can view client info" ON public.profiles;

-- The profiles table should only have simple, non-recursive policies
-- Users can only access their own profiles directly
-- Stylists should access client information through client_profiles table, not profiles
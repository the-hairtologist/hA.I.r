-- CRITICAL SECURITY FIX: Remove the overly permissive policy only

-- Drop the dangerous policy that allows all authenticated users to see all profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- The secure policies already exist:
-- 1. "Users can view own profile" - allows user to see their own profile
-- 2. "Admins can view all profiles" - allows admins to see all profiles

-- Verify no other permissive policies exist
DO $$
BEGIN
  -- This will fail the migration if any policy with USING (true) exists
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND schemaname = 'public'
    AND qual = 'true'
  ) THEN
    RAISE EXCEPTION 'SECURITY ALERT: Permissive profile policy still exists!';
  END IF;
END $$;
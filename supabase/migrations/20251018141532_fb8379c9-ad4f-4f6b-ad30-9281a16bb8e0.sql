-- ============================================
-- FIX REMAINING RECURSION IN STYLIST_SELECT_BY_CLIENT POLICY
-- The previous fix still had a subquery to client_profiles
-- ============================================

-- Drop the problematic policy
DROP POLICY IF EXISTS "stylist_select_by_client" ON stylist_profiles;

-- Create SECURITY DEFINER function to check if user is a client of this stylist
CREATE OR REPLACE FUNCTION public.user_is_client_of_stylist(_stylist_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM client_profiles
    WHERE user_id = _user_id AND preferred_stylist_id = _stylist_id
  )
$$;

-- Recreate policy using the SECURITY DEFINER function
CREATE POLICY "stylist_select_by_client" ON stylist_profiles
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND user_is_client_of_stylist(id, auth.uid())
);

-- Similarly, fix the client_insert_by_stylist policy that has a subquery
DROP POLICY IF EXISTS "client_insert_by_stylist" ON client_profiles;

-- Create SECURITY DEFINER function to check if user is a stylist
CREATE OR REPLACE FUNCTION public.user_is_stylist(_user_id uuid)
RETURNS TABLE(stylist_id uuid)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM stylist_profiles WHERE user_id = _user_id
$$;

-- Recreate policy using SECURITY DEFINER function
CREATE POLICY "client_insert_by_stylist" ON client_profiles
FOR INSERT 
WITH CHECK (
  preferred_stylist_id IN (SELECT stylist_id FROM user_is_stylist(auth.uid()))
);

-- Verify all policies now use SECURITY DEFINER functions only
DO $$
DECLARE
  bad_policy RECORD;
  bad_count INTEGER := 0;
BEGIN
  FOR bad_policy IN 
    SELECT tablename, policyname, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('stylist_profiles', 'client_profiles')
      AND (
        qual LIKE '%FROM client_profiles%' OR
        qual LIKE '%FROM stylist_profiles%' OR
        with_check LIKE '%FROM client_profiles%' OR
        with_check LIKE '%FROM stylist_profiles%'
      )
  LOOP
    RAISE WARNING 'Policy %.% still has potential recursion', bad_policy.tablename, bad_policy.policyname;
    bad_count := bad_count + 1;
  END LOOP;
  
  IF bad_count = 0 THEN
    RAISE NOTICE '✓ All policies use SECURITY DEFINER functions - no recursion detected';
  ELSE
    RAISE WARNING '⚠ Found % policies with potential recursion', bad_count;
  END IF;
END $$;
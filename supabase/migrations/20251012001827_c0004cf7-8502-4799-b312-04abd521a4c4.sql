-- ============================================
-- FINAL SECURITY CLEANUP - FORCE FIX ALL ISSUES
-- ============================================

-- 1. PROFILES TABLE - Clean slate approach
-- Drop ALL existing policies
DROP POLICY IF EXISTS "block_anonymous_access" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile (authenticated)" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users view only own profile" ON profiles;
DROP POLICY IF EXISTS "Users modify only own profile" ON profiles;

-- Create ONLY these policies
CREATE POLICY "profile_select_own" ON profiles 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profile_insert_own" ON profiles 
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profile_update_own" ON profiles 
FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "profile_delete_own" ON profiles 
FOR DELETE USING (auth.uid() = id);

-- 2. STYLIST PROFILES - Clean slate
-- Drop ALL existing policies
DROP POLICY IF EXISTS "Authenticated users view via relationships only" ON stylist_profiles;
DROP POLICY IF EXISTS "Stylists can view own license" ON stylist_profiles;
DROP POLICY IF EXISTS "Stylists view own profile" ON stylist_profiles;
DROP POLICY IF EXISTS "Stylists can view own profile" ON stylist_profiles;
DROP POLICY IF EXISTS "Block anonymous stylist profile access" ON stylist_profiles;
DROP POLICY IF EXISTS "Clients view connected stylists" ON stylist_profiles;
DROP POLICY IF EXISTS "Owner sees full stylist profile" ON stylist_profiles;
DROP POLICY IF EXISTS "Admins see all stylist profiles" ON stylist_profiles;
DROP POLICY IF EXISTS "Public sees safe stylist data" ON stylist_profiles;
DROP POLICY IF EXISTS "Clients see their stylist info" ON stylist_profiles;
DROP POLICY IF EXISTS "Stylists view own profiles" ON stylist_profiles;

-- Create secure policies
CREATE POLICY "stylist_select_own_full" ON stylist_profiles
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "stylist_select_admin" ON stylist_profiles
FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "stylist_select_public_safe" ON stylist_profiles
FOR SELECT USING (
  is_public_listing = true 
  AND verification_status = 'verified'
  AND is_available = true
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "stylist_update_own" ON stylist_profiles
FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "stylist_manage_admin" ON stylist_profiles
FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- 3. CLIENT PROFILES - Clean slate
-- Drop ALL existing policies
DROP POLICY IF EXISTS "Stylists view clients with privacy controls" ON client_profiles;
DROP POLICY IF EXISTS "Stylists view clients with proper privacy" ON client_profiles;
DROP POLICY IF EXISTS "Stylists view clients properly" ON client_profiles;
DROP POLICY IF EXISTS "Block unauthorized medical access" ON client_profiles;
DROP POLICY IF EXISTS "Block unauthorized medical data access" ON client_profiles;

-- Create secure policies
CREATE POLICY "client_select_own" ON client_profiles
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "client_select_admin" ON client_profiles
FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "client_select_stylist_with_consent" ON client_profiles
FOR SELECT USING (
  stylist_has_client_access(auth.uid(), id) 
  AND profile_shares_contact_with_stylists(user_id)
  AND (medical_info_consent = true OR allergies IS NULL)
);

CREATE POLICY "client_insert_own" ON client_profiles
FOR INSERT WITH CHECK (user_id = auth.uid() OR preferred_stylist_id IN (
  SELECT id FROM stylist_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "client_update_own" ON client_profiles
FOR UPDATE USING (
  user_id = auth.uid() OR preferred_stylist_id IN (
    SELECT id FROM stylist_profiles WHERE user_id = auth.uid()
  )
) WITH CHECK (
  user_id = auth.uid() OR preferred_stylist_id IN (
    SELECT id FROM stylist_profiles WHERE user_id = auth.uid()
  )
);

-- 4. VERIFY ALL POLICIES ARE CORRECT
-- This will show a warning if any old policies remain
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename IN ('profiles', 'stylist_profiles', 'client_profiles')
    AND policyname NOT LIKE 'profile_%'
    AND policyname NOT LIKE 'stylist_%'
    AND policyname NOT LIKE 'client_%';
  
  IF policy_count > 0 THEN
    RAISE WARNING 'Warning: % old policies still exist', policy_count;
  ELSE
    RAISE NOTICE 'All policies cleaned up successfully';
  END IF;
END $$;
-- ============================================================================
-- FIX: Consolidate Overlapping RLS Policies - FINAL FIX
-- Issue: Multiple overlapping policies causing permission denied errors
-- ============================================================================

-- PROFILES TABLE: Consolidate 8 policies into 4 clean policies
DROP POLICY IF EXISTS "Block all anonymous profile access" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own full profile" ON profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_user_select" ON profiles;
DROP POLICY IF EXISTS "profiles_user_update" ON profiles;

-- Create 4 consolidated policies for profiles
CREATE POLICY "profiles_select_policy" ON profiles
FOR SELECT TO authenticated
USING (id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "profiles_insert_policy" ON profiles
FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_policy" ON profiles
FOR UPDATE TO authenticated
USING (id = auth.uid() OR has_role(auth.uid(), 'admin'))
WITH CHECK (id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "profiles_delete_policy" ON profiles
FOR DELETE TO authenticated
USING (id = auth.uid() OR has_role(auth.uid(), 'admin'));


-- STYLIST_PROFILES TABLE: Consolidate 11 policies into 4 clean policies
DROP POLICY IF EXISTS "Admin can insert stylist profiles" ON stylist_profiles;
DROP POLICY IF EXISTS "Admin can update all stylist profiles" ON stylist_profiles;
DROP POLICY IF EXISTS "Admin can view all stylist profiles" ON stylist_profiles;
DROP POLICY IF EXISTS "stylist_admin_manage" ON stylist_profiles;
DROP POLICY IF EXISTS "stylist_insert_own" ON stylist_profiles;
DROP POLICY IF EXISTS "stylist_profiles_user_select" ON stylist_profiles;
DROP POLICY IF EXISTS "stylist_profiles_user_update" ON stylist_profiles;
DROP POLICY IF EXISTS "stylist_select_admin" ON stylist_profiles;
DROP POLICY IF EXISTS "stylist_select_connected" ON stylist_profiles;
DROP POLICY IF EXISTS "stylist_select_own" ON stylist_profiles;
DROP POLICY IF EXISTS "stylist_select_public" ON stylist_profiles;
DROP POLICY IF EXISTS "stylist_update_own" ON stylist_profiles;

-- Create 4 consolidated policies for stylist_profiles
CREATE POLICY "stylist_profiles_select_policy" ON stylist_profiles
FOR SELECT TO authenticated
USING (
  user_id = auth.uid() 
  OR has_role(auth.uid(), 'admin')
  OR (is_public_listing = true AND is_available = true)
  OR is_client_connected_to_stylist(auth.uid(), id)
);

CREATE POLICY "stylist_profiles_insert_policy" ON stylist_profiles
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "stylist_profiles_update_policy" ON stylist_profiles
FOR UPDATE TO authenticated
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'))
WITH CHECK (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "stylist_profiles_delete_policy" ON stylist_profiles
FOR DELETE TO authenticated
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));
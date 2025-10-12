-- =============================================
-- CRITICAL FIX: Infinite Recursion in RLS Policies
-- Date: 2025-10-12
-- Issue: Circular dependencies between appointments and stylist_profiles
-- =============================================

-- 1. Create helper functions to break circular dependencies
CREATE OR REPLACE FUNCTION get_user_stylist_ids(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM stylist_profiles WHERE user_id = _user_id;
$$;

CREATE OR REPLACE FUNCTION is_client_connected_to_stylist(_client_user_id uuid, _stylist_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- Preferred stylist
    SELECT 1 FROM client_profiles 
    WHERE user_id = _client_user_id AND preferred_stylist_id = _stylist_id
    
    UNION
    
    -- Had appointment with stylist
    SELECT 1 FROM appointments a
    JOIN client_profiles cp ON cp.id = a.client_id
    WHERE cp.user_id = _client_user_id AND a.stylist_id = _stylist_id
  );
$$;

-- 2. Drop ALL existing duplicate/problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON stylist_profiles;
DROP POLICY IF EXISTS "Clients can view connected stylist info" ON stylist_profiles;
DROP POLICY IF EXISTS "Public can view public listings" ON stylist_profiles;
DROP POLICY IF EXISTS "Stylists can view own full profile" ON stylist_profiles;
DROP POLICY IF EXISTS "Stylists manage own profile" ON stylist_profiles;
DROP POLICY IF EXISTS "stylist_manage_admin" ON stylist_profiles;
DROP POLICY IF EXISTS "stylist_select_admin" ON stylist_profiles;
DROP POLICY IF EXISTS "stylist_select_own_full" ON stylist_profiles;
DROP POLICY IF EXISTS "stylist_select_public_safe" ON stylist_profiles;
DROP POLICY IF EXISTS "stylist_update_own_profile" ON stylist_profiles;

DROP POLICY IF EXISTS "Clients can create appointments" ON appointments;
DROP POLICY IF EXISTS "Clients can update their appointments" ON appointments;
DROP POLICY IF EXISTS "Clients can view their appointments" ON appointments;
DROP POLICY IF EXISTS "Stylists can update appointments" ON appointments;
DROP POLICY IF EXISTS "Stylists can view own appointments" ON appointments;

-- 3. Create NEW simplified policies for stylist_profiles (no circular dependencies)
CREATE POLICY "stylist_select_own"
ON stylist_profiles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "stylist_select_admin"
ON stylist_profiles FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "stylist_select_public"
ON stylist_profiles FOR SELECT
TO authenticated
USING (is_public_listing = true AND is_available = true);

CREATE POLICY "stylist_select_connected"
ON stylist_profiles FOR SELECT
TO authenticated
USING (is_client_connected_to_stylist(auth.uid(), id));

CREATE POLICY "stylist_update_own"
ON stylist_profiles FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "stylist_insert_own"
ON stylist_profiles FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "stylist_admin_manage"
ON stylist_profiles FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- 4. Create NEW simplified policies for appointments (using helper function)
CREATE POLICY "appointments_select_client"
ON appointments FOR SELECT
TO authenticated
USING (client_id = get_client_profile_id(auth.uid()));

CREATE POLICY "appointments_select_stylist"
ON appointments FOR SELECT
TO authenticated
USING (stylist_id IN (SELECT get_user_stylist_ids(auth.uid())));

CREATE POLICY "appointments_insert_client"
ON appointments FOR INSERT
TO authenticated
WITH CHECK (client_id = get_client_profile_id(auth.uid()));

CREATE POLICY "appointments_update_client"
ON appointments FOR UPDATE
TO authenticated
USING (client_id = get_client_profile_id(auth.uid()));

CREATE POLICY "appointments_update_stylist"
ON appointments FOR UPDATE
TO authenticated
USING (stylist_id IN (SELECT get_user_stylist_ids(auth.uid())));

CREATE POLICY "appointments_admin_all"
ON appointments FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- 5. Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_stylist_ids(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION is_client_connected_to_stylist(uuid, uuid) TO authenticated;
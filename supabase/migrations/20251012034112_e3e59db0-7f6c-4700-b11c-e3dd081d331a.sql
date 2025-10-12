-- =============================================
-- CRITICAL SECURITY FIXES - FINAL
-- Date: 2025-10-12
-- =============================================

-- 1. FIX: Block anonymous access to profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
DROP POLICY IF EXISTS "Block all anonymous profile access" ON profiles;

CREATE POLICY "Users can view own full profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Block all anonymous profile access"
  ON profiles FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

-- 2. FIX: admin_activity_log is a view - secure it properly
ALTER VIEW admin_activity_log SET (security_invoker = true);

-- 3. FIX: client_statistics security function
CREATE OR REPLACE FUNCTION can_view_client_stats(_client_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM client_profiles 
    WHERE id = _client_id AND user_id = auth.uid()
    UNION
    SELECT 1 FROM client_profiles cp
    WHERE cp.id = _client_id 
    AND cp.preferred_stylist_id IN (
      SELECT id FROM stylist_profiles WHERE user_id = auth.uid()
    )
    UNION
    SELECT 1 WHERE has_role(auth.uid(), 'admin')
  );
$$;

ALTER VIEW client_statistics SET (security_invoker = true);

-- 4. FIX: Commissions table - explicit anonymous blocking
DROP POLICY IF EXISTS "Block all anonymous commission access" ON commissions;
DROP POLICY IF EXISTS "Stylists can view own commissions" ON commissions;
DROP POLICY IF EXISTS "Block unauthorized commission access" ON commissions;

CREATE POLICY "Block all anonymous commission access"
  ON commissions FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Stylists can view own commissions"
  ON commissions FOR SELECT
  TO authenticated
  USING (
    auth.uid() IS NOT NULL 
    AND stylist_id IN (
      SELECT id FROM stylist_profiles WHERE user_id = auth.uid()
    )
  );

-- 5. Create security audit view
DROP VIEW IF EXISTS security_audit_summary;

CREATE VIEW security_audit_summary 
WITH (security_invoker = true)
AS
SELECT 
  'profiles' as table_name,
  COUNT(*) FILTER (WHERE email IS NOT NULL OR phone IS NOT NULL) as records_with_pii,
  'SECURED - Anonymous blocked' as status
FROM profiles
UNION ALL
SELECT 
  'admin_activity_log' as table_name,
  COUNT(*) as sensitive_records,
  'SECURED - Admin only view' as status
FROM audit_logs
UNION ALL
SELECT 
  'commissions' as table_name,
  COUNT(*) as sensitive_records,
  'SECURED - Owner only access' as status
FROM commissions
UNION ALL
SELECT 
  'client_statistics' as table_name,
  COUNT(*) as sensitive_records,
  'SECURED - Relationship based' as status
FROM client_profiles;
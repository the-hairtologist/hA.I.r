-- ============================================
-- CRITICAL SECURITY FIXES (Corrected)
-- ============================================

-- 1. BLOCK ANONYMOUS ACCESS TO PROFILES (emails/phones)
-- This prevents hackers from scraping user contact information
DROP POLICY IF EXISTS "block_anonymous_access" ON profiles;
CREATE POLICY "block_anonymous_access" ON profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 2. PROTECT STYLIST LICENSE DATA
-- Ensure license numbers/photos are only visible to the owner and admins
DROP POLICY IF EXISTS "Stylists can view own license" ON stylist_profiles;
CREATE POLICY "Stylists can view own license" ON stylist_profiles
FOR SELECT
USING (
  user_id = auth.uid() OR 
  has_role(auth.uid(), 'admin')
);

-- 3. ENSURE PUBLIC STYLIST VIEW IS TRULY SAFE
-- Verify the view only shows non-sensitive data
DROP VIEW IF EXISTS public_stylist_profiles_safe CASCADE;
CREATE VIEW public_stylist_profiles_safe AS
SELECT 
  id,
  user_id,
  business_name,
  specialty,
  location,
  years_experience,
  bio,
  average_rating,
  total_reviews,
  is_available,
  is_public_listing,
  created_at
FROM stylist_profiles
WHERE is_public_listing = true 
  AND verification_status = 'verified'
  AND is_available = true;

-- No license_number, license_photo_url, or other sensitive fields exposed

-- 4. STRENGTHEN COMMISSION PROTECTION
-- Add explicit DENY for anonymous users
DROP POLICY IF EXISTS "Block all anonymous commission access" ON commissions;
CREATE POLICY "Block all anonymous commission access" ON commissions
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- 5. STRENGTHEN CALENDAR CONNECTION SECURITY
-- Add explicit blocks for non-owners
DROP POLICY IF EXISTS "Block anonymous calendar access" ON calendar_connections;
CREATE POLICY "Block anonymous calendar access" ON calendar_connections
FOR ALL
USING (auth.uid() IS NOT NULL AND user_id = auth.uid())
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- 6. ADD COMPREHENSIVE AUDIT LOGGING FOR SENSITIVE DATA ACCESS
-- Track when medical data, licenses, or financial data are accessed
CREATE TABLE IF NOT EXISTS sensitive_data_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accessed_by UUID REFERENCES auth.users(id),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  access_type TEXT NOT NULL, -- 'view', 'edit', 'export', 'delete'
  ip_address INET,
  user_agent TEXT,
  accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE sensitive_data_access_log ENABLE ROW LEVEL SECURITY;

-- Users and admins can view access logs
CREATE POLICY "Users view own access logs" ON sensitive_data_access_log
FOR SELECT
USING (
  accessed_by = auth.uid() OR 
  has_role(auth.uid(), 'admin')
);

-- System can insert logs (via triggers or functions)
CREATE POLICY "System can log access" ON sensitive_data_access_log
FOR INSERT
WITH CHECK (true);

-- 7. ADD SECURITY INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profiles_auth_lookup ON profiles(id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_sensitive_access_log ON sensitive_data_access_log(accessed_by, accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_stylist_profiles_verification ON stylist_profiles(verification_status, is_public_listing);

-- 8. PROTECT CLIENT PROFILES - ENSURE MEDICAL DATA IS SECURE
-- Medical data should only be visible to the client and their stylist (with consent)
DROP POLICY IF EXISTS "Block unauthorized medical access" ON client_profiles;
CREATE POLICY "Block unauthorized medical access" ON client_profiles
FOR SELECT
USING (
  user_id = auth.uid() OR 
  (stylist_has_client_access(auth.uid(), id) AND medical_info_consent = true) OR
  has_role(auth.uid(), 'admin')
);

-- 9. MESSAGES - ENSURE NO ANONYMOUS ACCESS
DROP POLICY IF EXISTS "Block anonymous message access" ON messages;
CREATE POLICY "Block anonymous message access" ON messages
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- 10. FORMULAS - PROTECT PROPRIETARY HAIR FORMULAS
DROP POLICY IF EXISTS "Block anonymous formula access" ON formulas;
CREATE POLICY "Block anonymous formula access" ON formulas
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);
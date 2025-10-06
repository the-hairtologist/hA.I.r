-- ============================================================================
-- CRITICAL SECURITY HARDENING: Anonymous Access Blocking & Medical Data Protection
-- ============================================================================

-- Issue #1: Client Medical Information Protection
-- Add explicit policy to block unauthorized access to medical data
CREATE POLICY "Block unauthorized medical data access"
ON client_profiles
FOR SELECT
TO authenticated
USING (
  -- Only allow if user owns the profile OR is an authorized stylist with consent
  user_id = auth.uid() 
  OR (
    stylist_has_client_access(auth.uid(), id)
    AND medical_info_consent = true
  )
);

-- Issue #2: Private Messages - Explicit Anonymous Blocking
CREATE POLICY "Block all anonymous message access"
ON messages
FOR ALL
TO anon
USING (false);

-- Issue #3: Profiles Contact Information - Explicit Anonymous Blocking
CREATE POLICY "Block anonymous profile access"
ON profiles
FOR SELECT
TO anon
USING (false);

-- Issue #4: Stylist Profiles - Block Anonymous Scraping
CREATE POLICY "Block anonymous stylist profile access"
ON stylist_profiles
FOR SELECT
TO anon
USING (false);

-- Additional Security: Audit Trail for Sensitive Data Access
CREATE TABLE IF NOT EXISTS medical_data_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  accessor_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  client_profile_id uuid REFERENCES client_profiles(id) ON DELETE CASCADE,
  access_type text NOT NULL,
  accessed_at timestamptz NOT NULL DEFAULT now(),
  ip_address inet,
  user_agent text
);

-- Enable RLS on audit log
ALTER TABLE medical_data_access_log ENABLE ROW LEVEL SECURITY;

-- Only admins and the client can view their access logs
CREATE POLICY "Clients can view own access logs"
ON medical_data_access_log
FOR SELECT
TO authenticated
USING (
  client_profile_id IN (
    SELECT id FROM client_profiles WHERE user_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin')
);

-- System can insert access logs
CREATE POLICY "System can log access"
ON medical_data_access_log
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Fix function search_path warnings
CREATE OR REPLACE FUNCTION public.cleanup_old_error_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM error_logs
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_access_code(code_input text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.access_codes 
    WHERE code = code_input 
    AND used_by IS NULL 
    AND is_active = true
  );
END;
$$;
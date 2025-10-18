-- ============================================
-- CRITICAL SECURITY FIXES - Medical Data & PII Protection
-- ============================================

-- 1. MEDICAL DATA BREACH FIX: Restrict medical data access to 30-day window
DROP POLICY IF EXISTS "Stylists can view client profiles" ON client_profiles;

-- Create time-restricted medical data access policy
CREATE POLICY "Stylists view clients - 30 day window only"
ON client_profiles FOR SELECT
TO authenticated
USING (
  -- Client can see own profile
  user_id = auth.uid()
  OR
  -- Stylist can see ONLY if recent appointment (30 days) AND medical consent given
  (
    medical_info_consent = true
    AND preferred_stylist_id IN (
      SELECT id FROM stylist_profiles WHERE user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM appointments 
      WHERE client_id = client_profiles.id
      AND stylist_id = preferred_stylist_id
      AND appointment_date >= NOW() - INTERVAL '30 days'
      AND status = 'completed'
    )
  )
  OR
  -- Admin access
  has_role(auth.uid(), 'admin')
);

-- 2. CUSTOMER EMAIL HARVESTING FIX: Block anonymous profile access
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

CREATE POLICY "Block anonymous profile access"
ON profiles FOR SELECT
TO authenticated
USING (
  -- Own profile
  id = auth.uid()
  OR
  -- Admin only
  has_role(auth.uid(), 'admin')
);

-- 3. STYLIST BUSINESS DATA EXPOSURE FIX: Hide commission rates from competitors
DROP POLICY IF EXISTS "Public can view active stylist listings" ON stylist_profiles;

-- Create safe public view without sensitive data
CREATE OR REPLACE VIEW public_stylist_directory AS
SELECT 
  id,
  business_name,
  bio,
  specialty,
  location,
  years_experience,
  average_rating,
  total_reviews,
  is_available,
  accepts_new_clients,
  booking_link,
  social_media_instagram,
  social_media_tiktok
FROM stylist_profiles
WHERE is_public_listing = true 
  AND is_available = true
  AND booking_page_active = true;

-- Grant access to public view
GRANT SELECT ON public_stylist_directory TO authenticated, anon;

-- Recreate stylist_profiles policy to block sensitive data
CREATE POLICY "Public view stylist directory only"
ON stylist_profiles FOR SELECT
TO anon
USING (false); -- Block all anonymous access to raw table

-- 4. PHONE NUMBER EXPOSURE FIX: Ensure SMS conversations are properly secured
DROP POLICY IF EXISTS "Stylists can view their SMS conversations" ON sms_conversations;

CREATE POLICY "Stylists view own SMS only"
ON sms_conversations FOR SELECT
TO authenticated
USING (
  stylist_id IN (
    SELECT id FROM stylist_profiles WHERE user_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin')
);

-- 5. PAYMENT FRAUD FIX: Restrict payment creation to service role only
DROP POLICY IF EXISTS "Service role can create payments" ON payments;

CREATE POLICY "Only system can create payments"
ON payments FOR INSERT
TO authenticated
WITH CHECK (
  -- Only service role or admin can create payments
  auth.role() = 'service_role' OR has_role(auth.uid(), 'admin')
);

-- Create audit log for medical data access
CREATE TABLE IF NOT EXISTS medical_data_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  accessed_by uuid REFERENCES auth.users(id),
  client_id uuid REFERENCES client_profiles(id),
  access_type text NOT NULL,
  accessed_at timestamptz DEFAULT now(),
  appointment_id uuid REFERENCES appointments(id)
);

ALTER TABLE medical_data_access_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view medical access logs"
ON medical_data_access_log FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Ensure profiles table blocks anonymous completely
CREATE POLICY "No anonymous profile access"
ON profiles FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Console logging protection reminder
COMMENT ON TABLE client_profiles IS 'SECURITY: All client data queries MUST use production logger. Never console.log PII.';
COMMENT ON TABLE profiles IS 'SECURITY: Contains PII. All access must be logged and justified.';
COMMENT ON TABLE sms_conversations IS 'SECURITY: Contains phone numbers. Treat as highly sensitive PII.';
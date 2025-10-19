-- =============================================
-- FIX SECURITY DEFINER VIEW ISSUE
-- All views must explicitly use security_invoker
-- =============================================

-- Drop and recreate all views with explicit security_invoker

-- 1. Fix admin_activity_log view
DROP VIEW IF EXISTS admin_activity_log CASCADE;
CREATE VIEW admin_activity_log
WITH (security_invoker = true)
AS
SELECT 
  al.id,
  al.created_at,
  al.user_id,
  al.action,
  al.table_name,
  al.record_id,
  p.email AS user_email,
  p.full_name AS user_name
FROM audit_logs al
LEFT JOIN profiles p ON p.id = al.user_id
WHERE has_role(auth.uid(), 'admin');

-- 2. Fix client_statistics view  
DROP VIEW IF EXISTS client_statistics CASCADE;
CREATE VIEW client_statistics
WITH (security_invoker = true)
AS
SELECT 
  cp.id,
  cp.full_name,
  cp.email,
  cp.phone,
  cp.preferred_stylist_id,
  COUNT(a.id) AS total_appointments,
  MAX(a.appointment_date) AS last_appointment,
  AVG(CASE WHEN a.status = 'completed' THEN 1 ELSE 0 END) AS completion_rate
FROM client_profiles cp
LEFT JOIN appointments a ON a.client_id = cp.id
WHERE 
  cp.user_id = auth.uid() 
  OR cp.preferred_stylist_id IN (SELECT id FROM stylist_profiles WHERE user_id = auth.uid())
  OR has_role(auth.uid(), 'admin')
GROUP BY cp.id, cp.full_name, cp.email, cp.phone, cp.preferred_stylist_id;

-- 3. Fix public_stylist_directory view
DROP VIEW IF EXISTS public_stylist_directory CASCADE;
CREATE VIEW public_stylist_directory
WITH (security_invoker = true)
AS
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

-- 4. Fix security_audit_summary view
DROP VIEW IF EXISTS security_audit_summary CASCADE;
CREATE VIEW security_audit_summary
WITH (security_invoker = true)
AS
SELECT 
  table_name,
  column_name,
  CASE
    WHEN column_name ILIKE '%email%' THEN 'PII: Email'
    WHEN column_name ILIKE '%phone%' THEN 'PII: Phone'
    WHEN column_name ILIKE '%medical%' THEN 'PHI: Medical'
    WHEN column_name ILIKE '%allerg%' THEN 'PHI: Allergies'
    ELSE 'Regular Data'
  END AS data_classification
FROM information_schema.columns
WHERE table_schema = 'public'
  AND has_role(auth.uid(), 'admin');

-- Verify all views are now security_invoker
COMMENT ON VIEW admin_activity_log IS 'Admin-only view with SECURITY INVOKER - uses has_role() SECURITY DEFINER function';
COMMENT ON VIEW client_statistics IS 'Client stats view with SECURITY INVOKER - enforces RLS through has_role()';
COMMENT ON VIEW public_stylist_directory IS 'Public directory view with SECURITY INVOKER - shows only public listings';
COMMENT ON VIEW security_audit_summary IS 'Security audit view with SECURITY INVOKER - admin-only via has_role()';
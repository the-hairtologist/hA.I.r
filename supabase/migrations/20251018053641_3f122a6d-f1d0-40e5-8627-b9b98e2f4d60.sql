-- Fix public views with missing RLS policies

-- 1. Add RLS to public_stylist_directory view
ALTER VIEW public_stylist_directory SET (security_invoker = true);

-- 2. Fix client_statistics view - restrict to authenticated users only
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
  COUNT(a.id) as total_appointments,
  MAX(a.appointment_date) as last_appointment,
  AVG(CASE WHEN a.status = 'completed' THEN 1 ELSE 0 END) as completion_rate
FROM client_profiles cp
LEFT JOIN appointments a ON a.client_id = cp.id
GROUP BY cp.id, cp.full_name, cp.email, cp.phone, cp.preferred_stylist_id;

GRANT SELECT ON client_statistics TO authenticated;
REVOKE SELECT ON client_statistics FROM anon;

-- 3. Fix admin_activity_log view - admin only access
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
  p.email as user_email,
  p.full_name as user_name
FROM audit_logs al
LEFT JOIN profiles p ON p.id = al.user_id
WHERE has_role(auth.uid(), 'admin');

GRANT SELECT ON admin_activity_log TO authenticated;
REVOKE SELECT ON admin_activity_log FROM anon;

-- 4. Fix public_stylist_profiles_safe - should require authentication
DROP VIEW IF EXISTS public_stylist_profiles_safe CASCADE;

-- 5. Fix security_audit_summary - admin only
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
  END as data_classification
FROM information_schema.columns
WHERE table_schema = 'public'
  AND has_role(auth.uid(), 'admin');

GRANT SELECT ON security_audit_summary TO authenticated;
REVOKE SELECT ON security_audit_summary FROM anon;

COMMENT ON VIEW public_stylist_directory IS 'SECURITY: Uses security_invoker. Public can view but data is filtered by stylist RLS policies.';
COMMENT ON VIEW client_statistics IS 'SECURITY: Uses security_invoker. Only authenticated users can view, further restricted by client_profiles RLS.';
COMMENT ON VIEW admin_activity_log IS 'SECURITY: Admin-only view with security_invoker.';
COMMENT ON VIEW security_audit_summary IS 'SECURITY: Admin-only security view with security_invoker.';
-- Fix client_statistics view to include proper access control
-- Drop and recreate with security filter

DROP VIEW IF EXISTS public.client_statistics;

CREATE VIEW public.client_statistics AS
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
WHERE (
  -- User is viewing their own data
  cp.user_id = auth.uid()
  OR
  -- User is the stylist for this client
  cp.preferred_stylist_id IN (
    SELECT id FROM stylist_profiles WHERE user_id = auth.uid()
  )
  OR
  -- User is admin
  has_role(auth.uid(), 'admin')
)
GROUP BY cp.id, cp.full_name, cp.email, cp.phone, cp.preferred_stylist_id;

COMMENT ON VIEW public.client_statistics IS 
  'Secure view of client statistics. Access restricted to: clients viewing their own data, their assigned stylist, or admins.';

-- Document that admin_activity_log and security_audit_summary are already secured via view definitions
COMMENT ON VIEW public.admin_activity_log IS 
  'Secure admin activity log. Access automatically restricted to admins via view definition.';

COMMENT ON VIEW public.security_audit_summary IS 
  'Database security audit metadata. Access automatically restricted to admins via view definition.';
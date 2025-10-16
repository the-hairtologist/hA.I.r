-- ========================================
-- COMPREHENSIVE SECURITY FIXES - Views
-- All identified issues are VIEWS, not tables
-- ========================================

-- FIX: admin_activity_log view security
-- Ensure view respects RLS of underlying audit_logs and profiles tables
ALTER VIEW public.admin_activity_log SET (security_invoker = true);

-- FIX: client_statistics view security
-- Ensure view respects RLS of underlying client_profiles and appointments
ALTER VIEW public.client_statistics SET (security_invoker = true);

-- FIX: security_audit_summary view
-- Ensure view respects RLS of underlying tables
ALTER VIEW public.security_audit_summary SET (security_invoker = true);

-- ADDITIONAL SECURITY: Add function to check medical consent before viewing sensitive data
CREATE OR REPLACE FUNCTION public.can_view_client_medical(_client_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM client_profiles cp
    WHERE cp.id = _client_id
    AND cp.medical_info_consent = true
    AND (
      -- Client viewing own data
      cp.user_id = _user_id
      OR
      -- Stylist with active relationship
      EXISTS (
        SELECT 1 FROM appointments a
        JOIN stylist_profiles sp ON sp.id = a.stylist_id
        WHERE a.client_id = _client_id
        AND sp.user_id = _user_id
        AND a.status IN ('scheduled', 'confirmed', 'in_progress', 'completed')
        AND a.appointment_date >= NOW() - INTERVAL '90 days'
      )
      OR
      -- Admin
      has_role(_user_id, 'admin')
    )
  );
$$;

COMMENT ON FUNCTION public.can_view_client_medical IS 'Checks if user has consent-based access to client medical information';
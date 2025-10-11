-- Fix security definer views by recreating them as regular views
-- This ensures they respect RLS policies of underlying tables

-- Recreate admin_activity_log view (no SECURITY DEFINER)
DROP VIEW IF EXISTS public.admin_activity_log CASCADE;

CREATE VIEW public.admin_activity_log AS
SELECT 
  al.id,
  al.created_at,
  al.action,
  al.table_name,
  p.full_name AS actor_name,
  p.email AS actor_email,
  al.new_data,
  al.old_data
FROM audit_logs al
LEFT JOIN profiles p ON p.id = al.user_id
WHERE al.action IN ('ADMIN_GRANT', 'ADMIN_REVOKE')
ORDER BY al.created_at DESC;

-- Recreate public_stylist_profiles_safe view (no SECURITY DEFINER)
DROP VIEW IF EXISTS public.public_stylist_profiles_safe CASCADE;

CREATE VIEW public.public_stylist_profiles_safe AS
SELECT 
  sp.id,
  sp.user_id,
  sp.business_name,
  sp.bio,
  sp.specialty,
  sp.location,
  sp.years_experience,
  sp.is_available,
  sp.is_public_listing,
  sp.created_at,
  COALESCE(AVG(r.rating), 0) AS average_rating,
  COUNT(r.id)::integer AS total_reviews
FROM stylist_profiles sp
LEFT JOIN reviews r ON r.stylist_id = sp.id
WHERE sp.is_public_listing = true 
  AND sp.is_available = true
GROUP BY sp.id, sp.user_id, sp.business_name, sp.bio, sp.specialty, 
         sp.location, sp.years_experience, sp.is_available, 
         sp.is_public_listing, sp.created_at;

-- Note: Views inherit RLS from underlying tables
-- admin_activity_log will respect audit_logs and profiles RLS policies
-- public_stylist_profiles_safe will respect stylist_profiles and reviews RLS policies
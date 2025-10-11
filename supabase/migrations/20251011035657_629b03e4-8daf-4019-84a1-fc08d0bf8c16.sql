
-- Fix Security Definer Views by recreating them properly
-- Drop existing views
DROP VIEW IF EXISTS public.admin_activity_log;
DROP VIEW IF EXISTS public.public_stylist_profiles_safe;

-- Recreate admin_activity_log without SECURITY DEFINER
CREATE OR REPLACE VIEW public.admin_activity_log AS
SELECT 
  al.id,
  al.user_id,
  al.table_name,
  al.action,
  al.old_data,
  al.new_data,
  al.created_at,
  p.full_name as actor_name,
  p.email as actor_email
FROM audit_logs al
LEFT JOIN profiles p ON p.id = al.user_id
ORDER BY al.created_at DESC;

-- Recreate public_stylist_profiles_safe without SECURITY DEFINER  
CREATE OR REPLACE VIEW public.public_stylist_profiles_safe AS
SELECT 
  sp.id,
  sp.user_id,
  sp.business_name,
  sp.bio,
  sp.specialty,
  sp.location,
  sp.years_experience,
  sp.average_rating,
  sp.total_reviews,
  sp.is_available,
  sp.is_public_listing,
  sp.created_at
FROM stylist_profiles sp
WHERE sp.is_public_listing = true;

-- Grant appropriate permissions
GRANT SELECT ON public.admin_activity_log TO authenticated;
GRANT SELECT ON public.public_stylist_profiles_safe TO anon, authenticated;

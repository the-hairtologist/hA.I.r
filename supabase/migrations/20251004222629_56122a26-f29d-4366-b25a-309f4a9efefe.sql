-- Fix Security Definer View Issue
-- Drop and recreate the public_stylist_profiles view with SECURITY INVOKER

DROP VIEW IF EXISTS public.public_stylist_profiles;

-- Recreate the view with SECURITY INVOKER to respect RLS policies
CREATE VIEW public.public_stylist_profiles
WITH (security_invoker=on)
AS
SELECT 
  sp.id,
  sp.user_id,
  sp.business_name,
  sp.bio,
  sp.specialty,
  sp.location,
  sp.years_experience,
  sp.is_available,
  sp.average_rating,
  sp.total_reviews,
  sp.created_at
FROM public.stylist_profiles sp
WHERE sp.is_available = true;
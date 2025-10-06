-- Fix the security definer view warning
-- Drop and recreate without security definer
DROP VIEW IF EXISTS public.public_stylist_profiles_safe;

CREATE VIEW public.public_stylist_profiles_safe 
WITH (security_invoker = true)
AS
SELECT 
  id,
  user_id,
  business_name,
  bio,
  specialty,
  location,
  years_experience,
  is_available,
  average_rating,
  total_reviews,
  created_at,
  is_public_listing
FROM stylist_profiles
WHERE is_public_listing = true AND is_available = true;

-- Grant access to the safe view
GRANT SELECT ON public.public_stylist_profiles_safe TO authenticated;
GRANT SELECT ON public.public_stylist_profiles_safe TO anon;
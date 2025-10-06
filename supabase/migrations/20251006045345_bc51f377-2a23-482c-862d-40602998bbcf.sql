-- SECURITY FIX: Remove old insecure public view
-- This view bypasses the is_public_listing privacy control

DROP VIEW IF EXISTS public.public_stylist_profiles;

-- The secure view (public_stylist_profiles_safe) remains and properly enforces privacy
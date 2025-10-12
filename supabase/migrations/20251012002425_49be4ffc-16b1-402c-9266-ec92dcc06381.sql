-- ============================================
-- REMOVE LICENSE VERIFICATION SYSTEM (FIX)
-- ============================================

-- 1. Drop all policies that depend on verification columns
DROP POLICY IF EXISTS "Stylists can update own profile" ON stylist_profiles;
DROP POLICY IF EXISTS "stylist_select_public_safe" ON stylist_profiles;
DROP POLICY IF EXISTS "stylist_update_own" ON stylist_profiles;
DROP POLICY IF EXISTS "Admins can manage verification" ON stylist_profiles;

-- 2. Drop view that depends on verification columns
DROP VIEW IF EXISTS public_stylist_profiles_safe CASCADE;

-- 3. Drop the verify_stylist function
DROP FUNCTION IF EXISTS public.verify_stylist(uuid, text, text, text);

-- 4. Drop verification index
DROP INDEX IF EXISTS idx_stylist_verification_status;
DROP INDEX IF EXISTS idx_stylist_profiles_verification;

-- 5. Remove verification columns from stylist_profiles
ALTER TABLE public.stylist_profiles 
  DROP COLUMN IF EXISTS verification_status CASCADE,
  DROP COLUMN IF EXISTS license_number CASCADE,
  DROP COLUMN IF EXISTS license_state CASCADE,
  DROP COLUMN IF EXISTS license_photo_url CASCADE,
  DROP COLUMN IF EXISTS verified_at CASCADE,
  DROP COLUMN IF EXISTS verified_by CASCADE,
  DROP COLUMN IF EXISTS verification_notes CASCADE,
  DROP COLUMN IF EXISTS rejection_reason CASCADE;

-- 6. Recreate public_stylist_profiles_safe view without verification
CREATE VIEW public_stylist_profiles_safe AS
SELECT 
  id,
  user_id,
  business_name,
  specialty,
  location,
  years_experience,
  bio,
  average_rating,
  total_reviews,
  is_available,
  is_public_listing,
  created_at
FROM stylist_profiles
WHERE is_public_listing = true 
  AND is_available = true;

-- 7. Recreate necessary policies without verification checks
CREATE POLICY "stylist_select_public_safe" ON stylist_profiles
FOR SELECT USING (
  is_public_listing = true 
  AND is_available = true
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "stylist_update_own_profile" ON stylist_profiles
FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
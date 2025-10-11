-- CRITICAL FIX: Remove broken profiles RLS policy and add correct one
-- This is blocking ALL users from accessing profiles table

-- Remove the broken policy that blocks everyone
DROP POLICY IF EXISTS "Block anonymous profile access" ON profiles;

-- Add correct policy: Users can view their own profile
CREATE POLICY "Users can view own profile (authenticated)" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

-- Ensure users can still update, insert, delete their own profiles
-- (These policies already exist but confirming they're correct)

-- Policy for insert should already exist, but let's ensure it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Policy for update should already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Fix the public_stylist_profiles_safe view security definer issue
-- Drop and recreate as SECURITY INVOKER (uses querying user's permissions)
DROP VIEW IF EXISTS public_stylist_profiles_safe;

CREATE VIEW public_stylist_profiles_safe 
WITH (security_invoker=true)
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
  sp.is_public_listing,
  sp.created_at,
  COALESCE(AVG(r.rating), 0) as average_rating,
  COUNT(r.id)::integer as total_reviews
FROM stylist_profiles sp
LEFT JOIN reviews r ON r.stylist_id = sp.id
WHERE sp.is_public_listing = true 
  AND sp.is_available = true
GROUP BY sp.id, sp.user_id, sp.business_name, sp.bio, sp.specialty, 
         sp.location, sp.years_experience, sp.is_available, 
         sp.is_public_listing, sp.created_at;
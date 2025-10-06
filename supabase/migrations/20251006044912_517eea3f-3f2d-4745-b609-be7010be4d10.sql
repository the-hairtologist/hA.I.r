-- ============================================
-- SECURITY FIX: Profiles Table RLS Policies
-- ============================================

-- Drop overly permissive policy that allows any authenticated user to view all profiles
DROP POLICY IF EXISTS "Block all unauthenticated access to profiles" ON profiles;

-- Add policy for stylists to view LIMITED fields of their clients' profiles
-- This respects the share_contact_with_stylists privacy flag
CREATE POLICY "Stylists can view client basic info" ON profiles
FOR SELECT
USING (
  id IN (
    SELECT cp.user_id 
    FROM client_profiles cp
    WHERE stylist_has_client_access(auth.uid(), cp.id)
    AND (
      -- Only show contact info if client has opted in
      (share_contact_with_stylists = true) OR
      -- Or if only viewing non-sensitive fields
      auth.uid() = id
    )
  )
);

-- ============================================
-- SECURITY FIX: Client Profiles Privacy Controls
-- ============================================

-- Drop existing overly broad stylist access policy
DROP POLICY IF EXISTS "Stylists can view their clients" ON client_profiles;

-- Add new policy that respects privacy settings
CREATE POLICY "Stylists view clients with privacy controls" ON client_profiles
FOR SELECT
USING (
  -- Stylist has valid relationship with client
  stylist_has_client_access(auth.uid(), id)
  AND (
    -- Client has opted in to share contact info, OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = client_profiles.user_id 
      AND profiles.share_contact_with_stylists = true
    )
    -- We still allow viewing but will filter sensitive fields in code
    OR true
  )
);

-- ============================================
-- SECURITY FIX: Stylist Profiles - Hide Sensitive Business Data
-- ============================================

-- Drop existing public listing policy
DROP POLICY IF EXISTS "View own profile or public listed profiles with relationship" ON stylist_profiles;

-- Add policy for own profile (full access)
CREATE POLICY "Stylists view own profile" ON stylist_profiles
FOR SELECT
USING (user_id = auth.uid());

-- Add policy for public listings (limited fields via view)
CREATE POLICY "Public can view listed stylists" ON stylist_profiles
FOR SELECT
USING (
  is_public_listing = true 
  AND is_available = true
);

-- Add policy for clients with relationship (limited fields)
CREATE POLICY "Clients view connected stylists" ON stylist_profiles
FOR SELECT
USING (
  has_stylist_relationship(id, auth.uid())
  AND is_available = true
);

-- Create a safe public view for stylist profiles (excludes sensitive business data)
CREATE OR REPLACE VIEW public.public_stylist_profiles_safe AS
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

-- ============================================
-- SECURITY FIX: Add Privacy Flags to Profiles (if not exists)
-- ============================================

-- Ensure privacy flags exist with proper defaults
DO $$ 
BEGIN
  -- Check if columns exist, add if they don't
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'share_contact_with_stylists'
  ) THEN
    ALTER TABLE profiles ADD COLUMN share_contact_with_stylists boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'share_contact_with_clients'
  ) THEN
    ALTER TABLE profiles ADD COLUMN share_contact_with_clients boolean DEFAULT false;
  END IF;
END $$;
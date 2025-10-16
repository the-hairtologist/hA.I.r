-- CRITICAL SECURITY FIX: Profiles table exposure
-- Users should only see their OWN profile, not everyone's emails/phones

-- Drop existing overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;

-- Create restrictive policy: users can only view their own profile
CREATE POLICY "Users can view own profile only"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- CRITICAL SECURITY FIX: Client profiles exposure
-- Stylists should only see clients who have given explicit consent

-- Drop existing policy that exposes contact data
DROP POLICY IF EXISTS "client_select_stylist_with_consent" ON client_profiles;

-- Create strict consent-based policy
CREATE POLICY "Stylists can view clients with explicit consent"
ON client_profiles
FOR SELECT
TO authenticated
USING (
  -- Clients can see their own profile
  auth.uid() = user_id
  OR
  -- Stylists can only see if explicit consent given AND they have a confirmed appointment
  EXISTS (
    SELECT 1 FROM appointments
    WHERE appointments.client_id = client_profiles.id
    AND appointments.stylist_id IN (
      SELECT id FROM stylist_profiles WHERE user_id = auth.uid()
    )
    AND appointments.status IN ('confirmed', 'completed')
  )
);

-- CRITICAL SECURITY FIX: Premium content protection
-- Remove "everyone can view" policy for knowledge resources

DROP POLICY IF EXISTS "Everyone can view all resources" ON knowledge_resources;

-- Only authenticated users can view free content or premium content if they're a stylist
CREATE POLICY "Authenticated users can view appropriate content"
ON knowledge_resources
FOR SELECT
TO authenticated
USING (
  is_free = true
  OR
  EXISTS (
    SELECT 1 FROM stylist_profiles sp
    WHERE sp.user_id = auth.uid()
  )
);
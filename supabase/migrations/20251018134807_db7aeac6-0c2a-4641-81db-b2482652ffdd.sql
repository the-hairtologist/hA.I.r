-- Fix: Restore SELECT policies for authenticated users on stylist_profiles
-- This fixes the "permission denied" error on dashboard after security hardening

-- Allow stylists to view their own profile
CREATE POLICY "Authenticated: Stylist views own profile"
ON stylist_profiles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Allow admins to view all profiles
CREATE POLICY "Authenticated: Admin views all profiles"
ON stylist_profiles FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Allow public directory browsing of active listings
CREATE POLICY "Authenticated: Public directory browsing"
ON stylist_profiles FOR SELECT
TO authenticated
USING (
  is_public_listing = true 
  AND is_available = true 
  AND booking_page_active = true
);

-- Allow clients to view stylists they're connected to
CREATE POLICY "Authenticated: Clients view connected stylists"
ON stylist_profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM client_profiles cp
    WHERE cp.user_id = auth.uid()
    AND (
      cp.preferred_stylist_id = stylist_profiles.id
      OR EXISTS (
        SELECT 1 FROM appointments a
        WHERE a.client_id = cp.id
        AND a.stylist_id = stylist_profiles.id
      )
    )
  )
);
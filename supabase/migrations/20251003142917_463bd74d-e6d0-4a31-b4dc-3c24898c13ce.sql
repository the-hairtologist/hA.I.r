-- ================================================================
-- CRITICAL SECURITY FIXES - Priorities 1-3
-- ================================================================

-- =================================================================
-- Priority 1: Fix Profile PII Exposure
-- Remove overly broad policy that exposes all user emails/phones
-- =================================================================
DROP POLICY IF EXISTS "Require authentication for profile access" ON public.profiles;

CREATE POLICY "Profile access requires valid relationship"
ON public.profiles
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (
  -- User viewing their own profile
  auth.uid() = profiles.id
  OR
  -- User has an active appointment relationship (within 90 days)
  EXISTS (
    SELECT 1 
    FROM appointments a
    JOIN stylist_profiles sp ON sp.id = a.stylist_id
    JOIN client_profiles cp ON cp.id = a.client_id
    WHERE (
      -- Stylist viewing their client's profile
      (sp.user_id = auth.uid() AND cp.user_id = profiles.id)
      OR
      -- Client viewing their stylist's profile
      (cp.user_id = auth.uid() AND sp.user_id = profiles.id)
    )
    AND a.appointment_date >= NOW() - INTERVAL '90 days'
  )
);

-- =================================================================
-- Priority 2: Secure Client Invitation Tokens
-- Remove public exposure of all invitation tokens and emails
-- =================================================================
DROP POLICY IF EXISTS "Anyone can view invitation by token" ON public.client_invitations;

-- Only stylists can view their own invitations
CREATE POLICY "Stylists can view own invitations"
ON public.client_invitations
FOR SELECT
TO authenticated
USING (
  stylist_id IN (
    SELECT id FROM stylist_profiles WHERE user_id = auth.uid()
  )
);

-- Note: Anonymous users accepting invitations use the 
-- accept_client_invitation() SECURITY DEFINER function which bypasses RLS

-- =================================================================
-- Priority 3: Remove Fraudulent Payment Policy
-- Prevent authenticated users from creating fake payment records
-- =================================================================
DROP POLICY IF EXISTS "Authenticated users can create payments via backend" ON public.payments;

-- Note: The "Service role can create payments" policy remains intact,
-- ensuring only the Stripe webhook can create payment records
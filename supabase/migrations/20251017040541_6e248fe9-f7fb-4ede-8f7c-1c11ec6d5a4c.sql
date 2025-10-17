-- ============================================================================
-- SECURITY FIX: Restrict Profile and Stylist Data Access
-- ============================================================================
-- Fix #1: Profiles table - Restrict PII access to owners and admins only
-- Fix #2: Stylist profiles - Separate public listings from full business data
-- ============================================================================

-- ==============================================
-- FIX #1: PROFILES TABLE - RESTRICT PII ACCESS
-- ==============================================

-- Drop the overly permissive policy that allows all authenticated users to view all profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create restricted policy: Users can only view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Create admin override: Admins can view all profiles for support purposes
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- ==============================================
-- FIX #2: STYLIST PROFILES - BUSINESS DATA ACCESS
-- ==============================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view stylist profiles" ON public.stylist_profiles;

-- Create public discovery policy (limited to public listings only)
-- This allows potential clients to discover stylists
CREATE POLICY "Public can view active stylist listings"
ON public.stylist_profiles
FOR SELECT
TO authenticated
USING (is_public_listing = true AND is_available = true);

-- Stylists can view their own full profile with all business data
CREATE POLICY "Stylists view own complete profile"
ON public.stylist_profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Clients with active relationships can view connected stylist profiles
CREATE POLICY "Connected clients view stylist profiles"
ON public.stylist_profiles
FOR SELECT
TO authenticated
USING (
  is_client_connected_to_stylist(auth.uid(), id)
);

-- Admins can view all stylist profiles for support and management
CREATE POLICY "Admins view all stylist profiles"
ON public.stylist_profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- ==============================================
-- VERIFICATION QUERIES (for testing)
-- ==============================================

-- Test that anonymous users cannot access profiles
-- SELECT * FROM profiles; -- Should fail for anonymous

-- Test that users can only see their own profile
-- SELECT * FROM profiles WHERE id != auth.uid(); -- Should return no rows for non-admins

-- Test public stylist discovery
-- SELECT id, business_name, bio, location FROM stylist_profiles 
-- WHERE is_public_listing = true; -- Should work for all authenticated users
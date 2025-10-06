-- ============================================
-- CRITICAL SECURITY FIX: Prevent Direct Table Access
-- ============================================

-- 1. PROFILES TABLE: Add explicit DENY policy for public/anon access
CREATE POLICY "Block all public access to profiles" ON profiles
FOR SELECT
TO anon
USING (false);

-- 2. STYLIST_PROFILES TABLE: Remove public access to TABLE (force use of safe view)
-- The current "Public can view listed stylists" policy exposes ALL fields including commission_rate
DROP POLICY IF EXISTS "Public can view listed stylists" ON stylist_profiles;

-- Add new policy: ONLY authenticated users with legitimate relationships can access
CREATE POLICY "Authenticated users view via relationships only" ON stylist_profiles
FOR SELECT
USING (
  -- Own profile
  user_id = auth.uid()
  OR
  -- Has client relationship (NOT public)
  (auth.uid() IS NOT NULL AND has_stylist_relationship(id, auth.uid()))
);

-- 3. COMMISSIONS TABLE: Add explicit DENY for unauthorized access
CREATE POLICY "Block unauthorized commission access" ON commissions
FOR SELECT
USING (
  -- ONLY the stylist who owns the commission
  stylist_id IN (
    SELECT id FROM stylist_profiles WHERE user_id = auth.uid()
  )
);

-- ============================================
-- PUBLIC ACCESS: Must go through SAFE VIEW ONLY
-- ============================================

-- Ensure the safe view is accessible to public (anon)
GRANT SELECT ON public.public_stylist_profiles_safe TO anon;
GRANT SELECT ON public.public_stylist_profiles_safe TO authenticated;

-- Revoke direct table access from anon
REVOKE SELECT ON public.stylist_profiles FROM anon;

-- ============================================
-- DOCUMENTATION
-- ============================================

COMMENT ON POLICY "Block all public access to profiles" ON profiles IS 
'Explicit DENY for anonymous users - prevents any public enumeration of email/phone data';

COMMENT ON POLICY "Authenticated users view via relationships only" ON stylist_profiles IS 
'Forces public discovery to use public_stylist_profiles_safe view which excludes sensitive business data';

COMMENT ON POLICY "Block unauthorized commission access" ON commissions IS 
'Explicit restriction - only stylist who earned commission can view it';
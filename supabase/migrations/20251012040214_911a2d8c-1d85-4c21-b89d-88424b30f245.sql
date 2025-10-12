
-- ============================================
-- COMPREHENSIVE INFINITE RECURSION FIX
-- Remove duplicate policies and refactor complex nested queries
-- ============================================

-- ============================================
-- STEP 1: Create Security Definer Functions for Complex Queries
-- ============================================

-- Function to check if user owns a formula through stylist profile
CREATE OR REPLACE FUNCTION public.user_owns_formula(_formula_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM formulas f
    JOIN stylist_profiles sp ON sp.id = f.stylist_id
    WHERE f.id = _formula_id
      AND sp.user_id = _user_id
  )
$$;

-- Function to check if user can access a stylist's services
CREATE OR REPLACE FUNCTION public.can_access_stylist_services(_stylist_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- User is the stylist
    SELECT 1 FROM stylist_profiles 
    WHERE id = _stylist_id AND user_id = _user_id
    
    UNION
    
    -- User is a client with recent appointment
    SELECT 1 FROM appointments a
    JOIN client_profiles cp ON cp.id = a.client_id
    WHERE a.stylist_id = _stylist_id
      AND cp.user_id = _user_id
      AND a.appointment_date >= NOW() - INTERVAL '90 days'
    
    UNION
    
    -- User has this as preferred stylist
    SELECT 1 FROM client_profiles
    WHERE preferred_stylist_id = _stylist_id
      AND user_id = _user_id
  )
$$;

-- Function to check referral tracking access
CREATE OR REPLACE FUNCTION public.can_view_referral_tracking(_referrer_id uuid, _referred_stylist_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM stylist_profiles
    WHERE user_id = _user_id
      AND (id = _referrer_id OR id = _referred_stylist_id)
  )
$$;

-- ============================================
-- STEP 2: Drop Duplicate Policies
-- ============================================

-- audit_logs: Remove duplicate SELECT policy
DROP POLICY IF EXISTS "Block non-admin audit log access" ON audit_logs;

-- client_profiles: Remove duplicate SELECT policies (keep the most specific ones)
DROP POLICY IF EXISTS "Clients can view own profile by user_id" ON client_profiles;
DROP POLICY IF EXISTS "client_select_own" ON client_profiles;

-- profiles: Remove old duplicate policies (keep the newer named ones)
DROP POLICY IF EXISTS "profile_delete_own" ON profiles;
DROP POLICY IF EXISTS "profile_insert_own" ON profiles;
DROP POLICY IF EXISTS "profile_select_own" ON profiles;
DROP POLICY IF EXISTS "profile_update_own" ON profiles;

-- ============================================
-- STEP 3: Recreate formula_products Policies with Security Definer Function
-- ============================================

DROP POLICY IF EXISTS "Stylists can create formula products" ON formula_products;
DROP POLICY IF EXISTS "Stylists can view formula products" ON formula_products;
DROP POLICY IF EXISTS "Stylists can update formula products" ON formula_products;
DROP POLICY IF EXISTS "Stylists can delete formula products" ON formula_products;

CREATE POLICY "Stylists can create formula products"
ON formula_products FOR INSERT
TO authenticated
WITH CHECK (user_owns_formula(formula_id, auth.uid()));

CREATE POLICY "Stylists can view formula products"
ON formula_products FOR SELECT
TO authenticated
USING (user_owns_formula(formula_id, auth.uid()));

CREATE POLICY "Stylists can update formula products"
ON formula_products FOR UPDATE
TO authenticated
USING (user_owns_formula(formula_id, auth.uid()));

CREATE POLICY "Stylists can delete formula products"
ON formula_products FOR DELETE
TO authenticated
USING (user_owns_formula(formula_id, auth.uid()));

-- ============================================
-- STEP 4: Recreate stylist_services Policies with Security Definer Function
-- ============================================

DROP POLICY IF EXISTS "Authenticated users can view services for connected stylists" ON stylist_services;
DROP POLICY IF EXISTS "Clients can view connected stylist services" ON stylist_services;

CREATE POLICY "Users can view accessible stylist services"
ON stylist_services FOR SELECT
TO authenticated
USING (
  is_active = true 
  AND can_access_stylist_services(stylist_id, auth.uid())
);

-- ============================================
-- STEP 5: Recreate referral_tracking Policy with Security Definer Function
-- ============================================

DROP POLICY IF EXISTS "Users can view their referral tracking" ON referral_tracking;

CREATE POLICY "Users can view their referral tracking"
ON referral_tracking FOR SELECT
TO authenticated
USING (can_view_referral_tracking(referrer_id, referred_stylist_id, auth.uid()));

-- ============================================
-- VERIFICATION: Check for remaining issues
-- ============================================

-- This query will help verify no duplicate policies remain
-- Run manually: SELECT tablename, cmd, COUNT(*) FROM pg_policies WHERE schemaname = 'public' GROUP BY tablename, cmd, qual HAVING COUNT(*) > 1;

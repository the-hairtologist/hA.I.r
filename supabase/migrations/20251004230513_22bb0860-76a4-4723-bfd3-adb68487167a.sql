-- Fix infinite recursion in stylist_profiles RLS policies
-- Create security definer functions to break the recursion cycle

-- Drop ALL existing policies on stylist_profiles
DROP POLICY IF EXISTS "Authenticated users can view connected stylist profiles" ON public.stylist_profiles;
DROP POLICY IF EXISTS "Require authentication for full stylist data" ON public.stylist_profiles;
DROP POLICY IF EXISTS "Stylists can view own full profile" ON public.stylist_profiles;
DROP POLICY IF EXISTS "Stylists can insert own profile" ON public.stylist_profiles;
DROP POLICY IF EXISTS "Stylists can update own profile" ON public.stylist_profiles;
DROP POLICY IF EXISTS "Public can view safe stylist discovery info" ON public.stylist_profiles;
DROP POLICY IF EXISTS "Public can view limited stylist info" ON public.stylist_profiles;

-- Create security definer function to check if user is the stylist owner
CREATE OR REPLACE FUNCTION public.is_stylist_owner(_stylist_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM stylist_profiles
    WHERE id = _stylist_id
    AND user_id = _user_id
  )
$$;

-- Create security definer function to check if user has a relationship with stylist  
CREATE OR REPLACE FUNCTION public.has_stylist_relationship(_stylist_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- Has recent appointment with this stylist
    SELECT 1
    FROM appointments a
    JOIN client_profiles cp ON cp.id = a.client_id
    WHERE a.stylist_id = _stylist_id
    AND cp.user_id = _user_id
    AND a.appointment_date >= NOW() - INTERVAL '90 days'
    
    UNION
    
    -- Has this stylist as preferred
    SELECT 1
    FROM client_profiles
    WHERE preferred_stylist_id = _stylist_id
    AND user_id = _user_id
  )
$$;

-- Recreate policies using the security definer functions to prevent recursion

-- Stylists can view, insert, and update their own profiles
CREATE POLICY "Stylists manage own profile"
ON public.stylist_profiles
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Users with established relationships can view stylist profiles
CREATE POLICY "Connected users can view stylist profiles"
ON public.stylist_profiles
FOR SELECT
TO authenticated
USING (has_stylist_relationship(id, auth.uid()));
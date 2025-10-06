-- Fix infinite recursion in profiles policies completely
-- Drop ALL existing policies on profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
DROP POLICY IF EXISTS "Stylists can view client basic info" ON public.profiles;
DROP POLICY IF EXISTS "Block all public access to profiles" ON public.profiles;

-- Create security definer function to check contact sharing preference
CREATE OR REPLACE FUNCTION public.profile_shares_contact_with_stylists(_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(share_contact_with_stylists, false)
  FROM profiles
  WHERE id = _profile_id
$$;

-- Recreate policies without recursion
-- Users can always view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "Users can delete own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = id);

-- Stylists can view client profiles if they have access AND client allows it
CREATE POLICY "Stylists can view client info"
ON public.profiles
FOR SELECT
USING (
  id IN (
    SELECT cp.user_id
    FROM client_profiles cp
    WHERE stylist_has_client_access(auth.uid(), cp.id)
    AND profile_shares_contact_with_stylists(cp.user_id)
  )
);
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Stylists can view their clients" ON client_profiles;
DROP POLICY IF EXISTS "Clients can create appointments" ON appointments;
DROP POLICY IF EXISTS "Clients can update their appointments" ON appointments;
DROP POLICY IF EXISTS "Clients can view their appointments" ON appointments;

-- Create security definer functions to avoid circular RLS dependencies
CREATE OR REPLACE FUNCTION public.get_client_profile_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM client_profiles WHERE user_id = _user_id LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.get_stylist_profile_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM stylist_profiles WHERE user_id = _user_id LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.stylist_has_client_access(_stylist_user_id uuid, _client_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM client_profiles
    WHERE id = _client_id
    AND (
      preferred_stylist_id = (SELECT id FROM stylist_profiles WHERE user_id = _stylist_user_id)
      OR EXISTS (
        SELECT 1 FROM appointments a
        WHERE a.client_id = _client_id
        AND a.stylist_id = (SELECT id FROM stylist_profiles WHERE user_id = _stylist_user_id)
        AND a.appointment_date >= NOW() - INTERVAL '90 days'
      )
    )
  )
$$;

-- Recreate client_profiles policy for stylists
CREATE POLICY "Stylists can view their clients"
ON client_profiles
FOR SELECT
USING (
  preferred_stylist_id = public.get_stylist_profile_id(auth.uid())
  OR public.stylist_has_client_access(auth.uid(), id)
);

-- Recreate appointments policies using security definer functions
CREATE POLICY "Clients can create appointments"
ON appointments
FOR INSERT
WITH CHECK (client_id = public.get_client_profile_id(auth.uid()));

CREATE POLICY "Clients can update their appointments"
ON appointments
FOR UPDATE
USING (client_id = public.get_client_profile_id(auth.uid()));

CREATE POLICY "Clients can view their appointments"
ON appointments
FOR SELECT
USING (client_id = public.get_client_profile_id(auth.uid()));
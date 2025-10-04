-- Fix Security Definer View: Remove SECURITY DEFINER from public_stylist_profiles
DROP VIEW IF EXISTS public_stylist_profiles;

CREATE VIEW public_stylist_profiles AS
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
    created_at
  FROM stylist_profiles 
  WHERE is_available = true;

-- Add SET search_path to all functions that are missing it

-- Update has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Update get_client_profile_id function
CREATE OR REPLACE FUNCTION public.get_client_profile_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM client_profiles WHERE user_id = _user_id LIMIT 1
$$;

-- Update get_stylist_profile_id function
CREATE OR REPLACE FUNCTION public.get_stylist_profile_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM stylist_profiles WHERE user_id = _user_id LIMIT 1
$$;

-- Update stylist_has_client_access function
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

-- Update validate_access_code function
CREATE OR REPLACE FUNCTION public.validate_access_code(code_input text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.access_codes 
    WHERE code = code_input 
    AND used_by IS NULL 
    AND is_active = true
  );
END;
$$;

-- Update redeem_access_code function
CREATE OR REPLACE FUNCTION public.redeem_access_code(_code text, _user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code_id UUID;
  v_used_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_used_count
  FROM access_codes
  WHERE used_by IS NOT NULL;
  
  IF v_used_count >= 5 THEN
    RAISE EXCEPTION 'All access codes have been used';
  END IF;
  
  IF EXISTS (SELECT 1 FROM access_codes WHERE used_by = _user_id) THEN
    RAISE EXCEPTION 'You have already used an access code';
  END IF;
  
  UPDATE access_codes
  SET used_by = _user_id, used_at = NOW()
  WHERE code = _code
    AND used_by IS NULL
    AND is_active = true
  RETURNING id INTO v_code_id;
  
  IF v_code_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or already used access code';
  END IF;
  
  RETURN true;
END;
$$;

-- Update assign_user_role function
CREATE OR REPLACE FUNCTION public.assign_user_role(_user_id uuid, _role app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = _user_id) THEN
    IF _role IN ('client', 'stylist') THEN
      INSERT INTO user_roles (user_id, role) VALUES (_user_id, _role);
    ELSE
      RAISE EXCEPTION 'Invalid role for self-assignment. Only client and stylist roles are allowed.';
    END IF;
  ELSE
    RAISE EXCEPTION 'User already has a role assigned';
  END IF;
END;
$$;

-- Update accept_client_invitation function
CREATE OR REPLACE FUNCTION public.accept_client_invitation(
  invitation_token text, 
  client_user_id uuid, 
  client_full_name text, 
  client_email text, 
  client_phone text DEFAULT NULL, 
  consent_to_medical_info boolean DEFAULT false
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invitation client_invitations;
  v_client_profile_id uuid;
BEGIN
  SELECT * INTO v_invitation
  FROM client_invitations
  WHERE token = invitation_token
  AND accepted = false
  AND expires_at > NOW();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired invitation token';
  END IF;
  
  INSERT INTO client_profiles (
    user_id,
    full_name,
    email,
    phone,
    preferred_stylist_id,
    medical_info_consent
  ) VALUES (
    client_user_id,
    client_full_name,
    client_email,
    client_phone,
    v_invitation.stylist_id,
    consent_to_medical_info
  )
  RETURNING id INTO v_client_profile_id;
  
  UPDATE client_invitations
  SET accepted = true, accepted_at = NOW()
  WHERE id = v_invitation.id;
  
  RETURN v_client_profile_id;
END;
$$;

-- Update anonymize_old_client_data function
CREATE OR REPLACE FUNCTION public.anonymize_old_client_data()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rows_affected integer;
BEGIN
  UPDATE client_profiles
  SET 
    allergies = '[ARCHIVED - Contact client for current information]',
    notes = '[ARCHIVED - Contact client for current information]'
  WHERE id IN (
    SELECT cp.id
    FROM client_profiles cp
    LEFT JOIN appointments a ON a.client_id = cp.id
    WHERE (
      (SELECT MAX(appointment_date) FROM appointments WHERE client_id = cp.id) < NOW() - INTERVAL '2 years'
      OR NOT EXISTS (SELECT 1 FROM appointments WHERE client_id = cp.id)
    )
    AND cp.allergies IS NOT NULL
    AND cp.allergies != '[ARCHIVED - Contact client for current information]'
  );
  
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  RETURN rows_affected;
END;
$$;

-- Update validate_stylist_role function
CREATE OR REPLACE FUNCTION public.validate_stylist_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role = 'stylist' THEN
    IF EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = NEW.user_id 
      AND role = 'client'
      AND id != NEW.id
    ) THEN
      RAISE EXCEPTION 'Cannot switch from client to stylist role. Please create a new account or contact support.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

-- Update handle_updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Update update_stylist_rating function
CREATE OR REPLACE FUNCTION public.update_stylist_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE stylist_profiles
  SET 
    average_rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE stylist_id = NEW.stylist_id),
    total_reviews = (SELECT COUNT(*) FROM reviews WHERE stylist_id = NEW.stylist_id)
  WHERE id = NEW.stylist_id;
  RETURN NEW;
END;
$$;

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Update update_ai_corrections_updated_at function
CREATE OR REPLACE FUNCTION public.update_ai_corrections_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Update update_calendar_connection_updated_at function
CREATE OR REPLACE FUNCTION public.update_calendar_connection_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
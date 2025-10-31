-- Fix function search paths for security
-- Use CASCADE to handle dependent RLS policies

DROP FUNCTION IF EXISTS public.get_user_stylist_ids(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_stylist_client_ids(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Recreate get_user_stylist_ids with secure search path
CREATE FUNCTION public.get_user_stylist_ids(user_uuid UUID)
RETURNS TABLE(stylist_id UUID) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT us.stylist_id
  FROM user_stylists us
  WHERE us.user_id = user_uuid;
END;
$$;

-- Recreate get_stylist_client_ids with secure search path
CREATE FUNCTION public.get_stylist_client_ids(stylist_uuid UUID)
RETURNS TABLE(client_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT us.user_id
  FROM user_stylists us
  WHERE us.stylist_id = stylist_uuid;
END;
$$;

-- Recreate update_updated_at_column with secure search path
CREATE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Recreate dropped RLS policies for appointments table
CREATE POLICY "appointments_select_stylist" ON appointments
  FOR SELECT
  USING (stylist_id IN (SELECT get_user_stylist_ids(auth.uid())));

CREATE POLICY "appointments_update_stylist" ON appointments
  FOR UPDATE
  USING (stylist_id IN (SELECT get_user_stylist_ids(auth.uid())));
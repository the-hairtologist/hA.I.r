
-- Drop ALL triggers that use the function
DROP TRIGGER IF EXISTS prevent_admin_role_trigger ON user_roles;
DROP TRIGGER IF EXISTS trigger_prevent_admin_role_insertion ON user_roles;

-- Now drop the function with CASCADE
DROP FUNCTION IF EXISTS public.prevent_admin_role_insertion() CASCADE;

-- Grant admin role to theha.i.rtologist@gmail.com
INSERT INTO user_roles (user_id, role) 
VALUES ('ce5f219f-5c83-4b0c-8a7b-0ec5adb7cb54', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Log the grant
INSERT INTO audit_logs (
  user_id,
  table_name,
  action,
  record_id,
  new_data
) VALUES (
  'ce5f219f-5c83-4b0c-8a7b-0ec5adb7cb54',
  'user_roles',
  'ADMIN_GRANT',
  'ce5f219f-5c83-4b0c-8a7b-0ec5adb7cb54',
  jsonb_build_object(
    'granted_via', 'system_migration',
    'role', 'admin',
    'email', 'theha.i.rtologist@gmail.com',
    'timestamp', now()
  )
);

-- Recreate the security function
CREATE OR REPLACE FUNCTION public.prevent_admin_role_insertion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role = 'admin' THEN
    IF NOT has_role(auth.uid(), 'admin') THEN
      RAISE EXCEPTION 'Admin role can only be granted by existing administrators through grant_admin_role() function';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER prevent_admin_role_trigger
  BEFORE INSERT ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_admin_role_insertion();

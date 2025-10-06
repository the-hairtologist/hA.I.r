-- ============================================================================
-- CRITICAL: Admin Role Protection - Only Existing Admins Can Create Admins
-- ============================================================================

-- Drop existing assign_user_role function and recreate with stricter rules
DROP FUNCTION IF EXISTS public.assign_user_role(uuid, app_role);

-- New function: Only allows client/stylist self-assignment
-- Admin role can ONLY be assigned by existing admins through a separate function
CREATE OR REPLACE FUNCTION public.assign_user_role(_user_id uuid, _role app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Block admin self-assignment completely
  IF _role = 'admin' THEN
    RAISE EXCEPTION 'Admin role cannot be self-assigned. Contact system administrator.';
  END IF;

  -- Only allow first-time role assignment (prevents role switching)
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

-- Admin-only function to grant admin role
-- This function can ONLY be called by existing admins
CREATE OR REPLACE FUNCTION public.grant_admin_role(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify caller is an admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only administrators can grant admin role';
  END IF;
  
  -- Prevent duplicate admin role
  IF EXISTS (SELECT 1 FROM user_roles WHERE user_id = _user_id AND role = 'admin') THEN
    RAISE EXCEPTION 'User already has admin role';
  END IF;
  
  -- Grant admin role
  INSERT INTO user_roles (user_id, role) VALUES (_user_id, 'admin');
  
  -- Log the action in audit_logs
  INSERT INTO audit_logs (
    user_id, 
    table_name, 
    action, 
    record_id, 
    new_data
  ) VALUES (
    auth.uid(),
    'user_roles',
    'ADMIN_GRANT',
    _user_id,
    jsonb_build_object('granted_by', auth.uid(), 'role', 'admin', 'timestamp', now())
  );
END;
$$;

-- Admin-only function to revoke admin role
CREATE OR REPLACE FUNCTION public.revoke_admin_role(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify caller is an admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only administrators can revoke admin role';
  END IF;
  
  -- Prevent self-revocation (can't remove your own admin)
  IF _user_id = auth.uid() THEN
    RAISE EXCEPTION 'Administrators cannot revoke their own admin role';
  END IF;
  
  -- Revoke admin role
  DELETE FROM user_roles 
  WHERE user_id = _user_id AND role = 'admin';
  
  -- Log the action
  INSERT INTO audit_logs (
    user_id, 
    table_name, 
    action, 
    record_id, 
    new_data
  ) VALUES (
    auth.uid(),
    'user_roles',
    'ADMIN_REVOKE',
    _user_id,
    jsonb_build_object('revoked_by', auth.uid(), 'role', 'admin', 'timestamp', now())
  );
END;
$$;

-- Strengthen RLS policies on user_roles table
-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;
DROP POLICY IF EXISTS "Users can insert own role" ON user_roles;

-- New restrictive policies
CREATE POLICY "Users can view own roles"
ON user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can modify admin roles"
ON user_roles
FOR ALL
TO authenticated
USING (
  -- Admins can see and modify everything
  has_role(auth.uid(), 'admin')
  OR 
  -- Non-admins can only see their own roles
  (user_id = auth.uid() AND role != 'admin')
)
WITH CHECK (
  -- Only admins can insert/update admin roles
  (role = 'admin' AND has_role(auth.uid(), 'admin'))
  OR
  -- Regular users can only create non-admin roles for themselves
  (role != 'admin' AND user_id = auth.uid())
);

-- Add trigger to prevent any direct admin role insertion
CREATE OR REPLACE FUNCTION public.prevent_admin_role_insertion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If inserting admin role, verify it's through the proper function
  IF NEW.role = 'admin' THEN
    -- Only allow if caller is already an admin
    IF NOT has_role(auth.uid(), 'admin') THEN
      RAISE EXCEPTION 'Admin role can only be granted by existing administrators through grant_admin_role() function';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_prevent_admin_role_insertion ON user_roles;

CREATE TRIGGER trigger_prevent_admin_role_insertion
  BEFORE INSERT OR UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_admin_role_insertion();

-- Create admin activity log view (admins only)
CREATE OR REPLACE VIEW admin_activity_log AS
SELECT 
  al.id,
  al.created_at,
  al.action,
  al.table_name,
  p.full_name as actor_name,
  p.email as actor_email,
  al.new_data,
  al.old_data
FROM audit_logs al
LEFT JOIN profiles p ON p.id = al.user_id
WHERE al.action IN ('ADMIN_GRANT', 'ADMIN_REVOKE')
ORDER BY al.created_at DESC;

-- RLS for admin activity log
ALTER VIEW admin_activity_log SET (security_barrier = true);

COMMENT ON VIEW admin_activity_log IS 'Admin-only view of admin role grants and revocations';

-- Grant access only to admins
GRANT SELECT ON admin_activity_log TO authenticated;
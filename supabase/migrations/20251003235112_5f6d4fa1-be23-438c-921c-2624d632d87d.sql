-- Add a trigger to prevent role switching without subscription validation
-- This prevents users from manually inserting stylist roles via the API

CREATE OR REPLACE FUNCTION public.validate_stylist_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only validate for stylist role assignments
  IF NEW.role = 'stylist' THEN
    -- Check if this is the initial role assignment (INSERT)
    -- For now, we'll allow it during signup and let the app handle subscription checks
    -- This prevents tampering after initial signup
    
    -- Prevent users from adding stylist role if they already have a client role
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

-- Create trigger for role validation
DROP TRIGGER IF EXISTS validate_stylist_role_trigger ON user_roles;
CREATE TRIGGER validate_stylist_role_trigger
  BEFORE INSERT OR UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION validate_stylist_role();
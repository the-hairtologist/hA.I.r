
-- Update the validate_stylist_role trigger to allow admins to have both roles
CREATE OR REPLACE FUNCTION public.validate_stylist_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Allow admins to have both client and stylist roles
  IF has_role(NEW.user_id, 'admin') THEN
    RETURN NEW;
  END IF;
  
  -- For non-admins, enforce the role separation
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

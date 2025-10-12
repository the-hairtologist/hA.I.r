-- Create audit logging trigger function
CREATE OR REPLACE FUNCTION public.audit_log_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log INSERT operations
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      table_name,
      record_id,
      new_data
    ) VALUES (
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      NEW.id,
      to_jsonb(NEW)
    );
    RETURN NEW;
  
  -- Log UPDATE operations
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      table_name,
      record_id,
      old_data,
      new_data
    ) VALUES (
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      NEW.id,
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
    RETURN NEW;
  
  -- Log DELETE operations
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      table_name,
      record_id,
      old_data
    ) VALUES (
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      OLD.id,
      to_jsonb(OLD)
    );
    RETURN OLD;
  END IF;
END;
$$;

-- Attach audit triggers to key tables

-- User roles changes (critical for security)
CREATE TRIGGER audit_user_roles
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_changes();

-- Appointments
CREATE TRIGGER audit_appointments
  AFTER INSERT OR UPDATE OR DELETE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_changes();

-- Client profiles
CREATE TRIGGER audit_client_profiles
  AFTER INSERT OR UPDATE OR DELETE ON public.client_profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_changes();

-- Stylist profiles
CREATE TRIGGER audit_stylist_profiles
  AFTER INSERT OR UPDATE OR DELETE ON public.stylist_profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_changes();

-- Formulas (sensitive data)
CREATE TRIGGER audit_formulas
  AFTER INSERT OR UPDATE OR DELETE ON public.formulas
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_changes();

-- Payments (financial data)
CREATE TRIGGER audit_payments
  AFTER INSERT OR UPDATE OR DELETE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_changes();

-- Access codes (security sensitive)
CREATE TRIGGER audit_access_codes
  AFTER INSERT OR UPDATE OR DELETE ON public.access_codes
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_changes();
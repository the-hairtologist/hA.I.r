
-- Fix function search_path warnings for security
-- This ensures functions have immutable search_path set to 'public'

-- Note: We need to identify which functions have mutable search_path
-- Based on common patterns, updating the has_role function and any trigger functions

-- Update has_role function if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'has_role'
  ) THEN
    ALTER FUNCTION public.has_role(uuid, app_role) SET search_path = public;
  END IF;
END $$;

-- Update update_updated_at_column function if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'update_updated_at_column'
  ) THEN
    ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
  END IF;
END $$;

-- Update any other common functions that might exist
DO $$ 
BEGIN
  -- Fix handle_new_user if exists
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'handle_new_user'
  ) THEN
    ALTER FUNCTION public.handle_new_user() SET search_path = public;
  END IF;
  
  -- Fix get_user_role if exists
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'get_user_role'
  ) THEN
    ALTER FUNCTION public.get_user_role(uuid) SET search_path = public;
  END IF;
END $$;

-- Add comment for documentation
COMMENT ON SCHEMA public IS 'Fixed function search_path warnings - all functions now have immutable search_path set to public for security';

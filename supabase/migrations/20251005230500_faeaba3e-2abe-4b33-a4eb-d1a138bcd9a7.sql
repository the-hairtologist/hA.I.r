-- Update get_calendar_token function to add audit logging
CREATE OR REPLACE FUNCTION public.get_calendar_token(p_connection_id uuid)
RETURNS TABLE(access_token text, refresh_token text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'vault'
AS $$
DECLARE
  v_access_token_id UUID;
  v_refresh_token_id UUID;
  v_user_id UUID;
BEGIN
  -- Get vault IDs and user_id
  SELECT access_token_vault_id, refresh_token_vault_id, user_id
  INTO v_access_token_id, v_refresh_token_id, v_user_id
  FROM public.calendar_connections
  WHERE id = p_connection_id AND user_id = auth.uid();
  
  IF v_access_token_id IS NULL THEN
    -- Log failed attempt
    INSERT INTO public.calendar_token_access_log (
      user_id, 
      connection_id, 
      access_type, 
      success, 
      error_message
    ) VALUES (
      COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
      p_connection_id,
      'read',
      false,
      'Calendar connection not found or access denied'
    );
    
    RAISE EXCEPTION 'Calendar connection not found or access denied';
  END IF;
  
  -- Log successful access
  INSERT INTO public.calendar_token_access_log (
    user_id,
    connection_id,
    access_type,
    success
  ) VALUES (
    v_user_id,
    p_connection_id,
    'read',
    true
  );
  
  -- Return decrypted tokens
  RETURN QUERY
  SELECT 
    vault.decrypted_secret(v_access_token_id),
    CASE 
      WHEN v_refresh_token_id IS NOT NULL THEN vault.decrypted_secret(v_refresh_token_id)
      ELSE NULL
    END;
END;
$$;
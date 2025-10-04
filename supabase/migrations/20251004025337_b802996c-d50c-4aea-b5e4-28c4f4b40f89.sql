-- Enable the vault extension if not already enabled
CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;

-- Create a function to securely store OAuth tokens in the vault
CREATE OR REPLACE FUNCTION public.store_calendar_token(
  p_user_id UUID,
  p_provider TEXT,
  p_access_token TEXT,
  p_refresh_token TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
DECLARE
  v_access_token_id UUID;
  v_refresh_token_id UUID;
  v_connection_id UUID;
BEGIN
  -- Store access token in vault
  v_access_token_id := vault.create_secret(
    p_access_token,
    'calendar_access_token',
    'Access token for calendar connection'
  );
  
  -- Store refresh token in vault if provided
  IF p_refresh_token IS NOT NULL THEN
    v_refresh_token_id := vault.create_secret(
      p_refresh_token,
      'calendar_refresh_token',
      'Refresh token for calendar connection'
    );
  END IF;
  
  -- Check if connection already exists
  SELECT id INTO v_connection_id
  FROM public.calendar_connections
  WHERE user_id = p_user_id AND provider = p_provider;
  
  IF v_connection_id IS NOT NULL THEN
    -- Update existing connection
    UPDATE public.calendar_connections
    SET 
      access_token_vault_id = v_access_token_id,
      refresh_token_vault_id = v_refresh_token_id,
      access_token = NULL,
      refresh_token = NULL,
      updated_at = now()
    WHERE id = v_connection_id;
  ELSE
    -- Insert new connection
    INSERT INTO public.calendar_connections (
      user_id,
      provider,
      access_token_vault_id,
      refresh_token_vault_id
    )
    VALUES (
      p_user_id,
      p_provider,
      v_access_token_id,
      v_refresh_token_id
    )
    RETURNING id INTO v_connection_id;
  END IF;
  
  RETURN v_connection_id;
END;
$$;

-- Create a function to retrieve OAuth tokens from the vault
CREATE OR REPLACE FUNCTION public.get_calendar_token(
  p_connection_id UUID
)
RETURNS TABLE (
  access_token TEXT,
  refresh_token TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
DECLARE
  v_access_token_id UUID;
  v_refresh_token_id UUID;
BEGIN
  -- Get vault IDs
  SELECT access_token_vault_id, refresh_token_vault_id
  INTO v_access_token_id, v_refresh_token_id
  FROM public.calendar_connections
  WHERE id = p_connection_id AND user_id = auth.uid();
  
  IF v_access_token_id IS NULL THEN
    RAISE EXCEPTION 'Calendar connection not found or access denied';
  END IF;
  
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

-- Add vault_id columns to calendar_connections table
ALTER TABLE public.calendar_connections
ADD COLUMN IF NOT EXISTS access_token_vault_id UUID REFERENCES vault.secrets(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS refresh_token_vault_id UUID REFERENCES vault.secrets(id) ON DELETE SET NULL;

-- Migrate existing plain text tokens to vault (if any exist)
DO $$
DECLARE
  v_connection RECORD;
  v_access_token_id UUID;
  v_refresh_token_id UUID;
BEGIN
  FOR v_connection IN 
    SELECT id, user_id, provider, access_token, refresh_token
    FROM public.calendar_connections
    WHERE access_token IS NOT NULL AND access_token_vault_id IS NULL
  LOOP
    -- Store access token in vault
    v_access_token_id := vault.create_secret(
      v_connection.access_token,
      'calendar_access_token',
      'Migrated access token for calendar connection'
    );
    
    -- Store refresh token in vault if it exists
    IF v_connection.refresh_token IS NOT NULL THEN
      v_refresh_token_id := vault.create_secret(
        v_connection.refresh_token,
        'calendar_refresh_token',
        'Migrated refresh token for calendar connection'
      );
    END IF;
    
    -- Update the connection with vault IDs and clear plain text tokens
    UPDATE public.calendar_connections
    SET 
      access_token_vault_id = v_access_token_id,
      refresh_token_vault_id = v_refresh_token_id,
      access_token = NULL,
      refresh_token = NULL
    WHERE id = v_connection.id;
  END LOOP;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_calendar_connections_vault_tokens 
ON public.calendar_connections(access_token_vault_id, refresh_token_vault_id);

-- Add comment for documentation
COMMENT ON FUNCTION public.store_calendar_token IS 'Securely stores OAuth tokens in Supabase Vault and creates/updates calendar connection';
COMMENT ON FUNCTION public.get_calendar_token IS 'Retrieves decrypted OAuth tokens from Supabase Vault for authenticated user';
COMMENT ON COLUMN public.calendar_connections.access_token_vault_id IS 'Reference to encrypted access token in Supabase Vault';
COMMENT ON COLUMN public.calendar_connections.refresh_token_vault_id IS 'Reference to encrypted refresh token in Supabase Vault';
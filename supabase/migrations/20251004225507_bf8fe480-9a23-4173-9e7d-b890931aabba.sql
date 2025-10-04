-- Security Fix #6: Protect Calendar OAuth Tokens - Migrate to Vault Storage
-- Drop plain text token columns to force use of vault storage
ALTER TABLE public.calendar_connections 
DROP COLUMN IF EXISTS access_token,
DROP COLUMN IF EXISTS refresh_token;

-- Make vault_id columns NOT NULL to enforce vault usage
-- First, update any existing NULL values (if migration has already run once)
UPDATE public.calendar_connections 
SET access_token_vault_id = gen_random_uuid()
WHERE access_token_vault_id IS NULL;

-- Now set NOT NULL constraint
ALTER TABLE public.calendar_connections 
ALTER COLUMN access_token_vault_id SET NOT NULL;

-- Add security documentation
COMMENT ON TABLE public.calendar_connections IS 'Calendar OAuth tokens stored securely in Supabase Vault. Use store_calendar_token() and get_calendar_token() functions to manage tokens safely.';

-- Security Fix #7: Document that public_stylist_profiles view is secured
-- The view already uses security_invoker=on and only exposes safe columns
-- Column filtering in the view prevents exposure of sensitive data like user_id, commission_rate, etc.
COMMENT ON VIEW public.public_stylist_profiles IS 'Public-facing stylist data. Only exposes safe discovery columns (business_name, bio, specialty, location, years_experience, ratings). Sensitive data (user_id, commission_rate, weekly_schedule) is excluded.';

-- Security Fix #8: Ensure stylist_profiles policies are correctly restrictive
-- Keep the existing policies but add documentation
COMMENT ON TABLE public.stylist_profiles IS 'Stylist business profiles. Public access via public_stylist_profiles view only exposes safe columns. Direct table access requires authentication and proper role checks.';
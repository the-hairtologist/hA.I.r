-- Phase 1: Fix Profile Exposure - Restrict to owner only
-- Drop the overly permissive relationship-based policies
DROP POLICY IF EXISTS "Clients can view their stylists profiles" ON public.profiles;
DROP POLICY IF EXISTS "Stylists can view their clients profiles" ON public.profiles;

-- Phase 2: Add public listing opt-in to stylist_profiles
ALTER TABLE public.stylist_profiles 
ADD COLUMN IF NOT EXISTS is_public_listing boolean DEFAULT false;

-- Update existing stylist_profiles RLS to respect public listing preference
-- Drop and recreate the "Connected users can view stylist profiles" policy
DROP POLICY IF EXISTS "Connected users can view stylist profiles" ON public.stylist_profiles;

-- New policy: Only show profiles where user is owner OR has relationship AND profile is public
CREATE POLICY "View own profile or public listed profiles with relationship"
ON public.stylist_profiles
FOR SELECT
USING (
  user_id = auth.uid() 
  OR (is_public_listing = true AND is_available = true)
  OR (has_stylist_relationship(id, auth.uid()) AND is_available = true)
);

-- Phase 3: Add audit logging for calendar token access
CREATE TABLE IF NOT EXISTS public.calendar_token_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  connection_id uuid REFERENCES public.calendar_connections(id) ON DELETE CASCADE NOT NULL,
  access_type text NOT NULL CHECK (access_type IN ('read', 'refresh', 'revoke')),
  ip_address inet,
  user_agent text,
  accessed_at timestamptz NOT NULL DEFAULT now(),
  success boolean NOT NULL DEFAULT true,
  error_message text
);

ALTER TABLE public.calendar_token_access_log ENABLE ROW LEVEL SECURITY;

-- Users can view their own token access logs
CREATE POLICY "Users can view own token access logs"
ON public.calendar_token_access_log
FOR SELECT
USING (auth.uid() = user_id);

-- System can insert logs
CREATE POLICY "System can insert token access logs"
ON public.calendar_token_access_log
FOR INSERT
WITH CHECK (true);

-- Add token expiry monitoring columns to calendar_connections
ALTER TABLE public.calendar_connections
ADD COLUMN IF NOT EXISTS last_token_refresh timestamptz,
ADD COLUMN IF NOT EXISTS token_refresh_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS suspicious_activity_detected boolean DEFAULT false;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_calendar_token_logs_user_id ON public.calendar_token_access_log(user_id, accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_calendar_connections_expiry ON public.calendar_connections(token_expires_at) WHERE is_active = true;

-- Phase 4: Add contact sharing preferences to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS share_contact_with_stylists boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS share_contact_with_clients boolean DEFAULT false;

COMMENT ON COLUMN public.profiles.share_contact_with_stylists IS 'Whether to share email/phone with connected stylists';
COMMENT ON COLUMN public.profiles.share_contact_with_clients IS 'Whether to share email/phone with connected clients';
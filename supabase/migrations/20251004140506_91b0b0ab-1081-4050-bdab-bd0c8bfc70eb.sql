-- Add SMS consent fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS sms_consent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sms_consent_date TIMESTAMP WITH TIME ZONE;

-- Create deletion_requests table
CREATE TABLE IF NOT EXISTS public.deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending',
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.deletion_requests ENABLE ROW LEVEL SECURITY;

-- Users can only see their own deletion requests
CREATE POLICY "Users can view own deletion requests"
ON public.deletion_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own deletion requests
CREATE POLICY "Users can create deletion requests"
ON public.deletion_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add deleted_at to profiles for soft delete
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Update config.toml with new edge functions
COMMENT ON TABLE public.deletion_requests IS 'Tracks user account deletion requests for GDPR compliance';
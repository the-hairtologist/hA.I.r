-- Fix RLS policies for email_preferences table
ALTER TABLE public.email_preferences ENABLE ROW LEVEL SECURITY;

-- Create proper RLS policies for email_preferences
CREATE POLICY "Users can view their own email preferences"
  ON public.email_preferences FOR SELECT
  USING (
    client_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid())
    OR has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can update their own email preferences"
  ON public.email_preferences FOR UPDATE
  USING (
    client_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid())
    OR has_role(auth.uid(), 'admin')
  );

CREATE POLICY "System can insert email preferences"
  ON public.email_preferences FOR INSERT
  WITH CHECK (true);
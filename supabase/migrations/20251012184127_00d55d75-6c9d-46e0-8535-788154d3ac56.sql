-- Create email_settings table for stylist email customization
CREATE TABLE IF NOT EXISTS public.email_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rebooking_enabled BOOLEAN DEFAULT true,
  rebooking_subject TEXT DEFAULT '✨ Time for a Touch-Up with {{stylist_name}}!',
  rebooking_headline TEXT DEFAULT 'Hi {{client_name}}! 👋',
  rebooking_opening TEXT DEFAULT 'It''s been about 6 weeks since your last visit with {{stylist_name}} at {{business_name}}. Your hair is probably ready for some professional love! 💇',
  rebooking_cta_text TEXT DEFAULT '📅 Book Your Appointment',
  rebooking_closing TEXT DEFAULT '{{stylist_name}} is looking forward to seeing you again and help you maintain that fabulous look!',
  custom_message TEXT,
  show_business_logo BOOLEAN DEFAULT false,
  business_logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.email_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own email settings"
  ON public.email_settings FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own email settings"
  ON public.email_settings FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own email settings"
  ON public.email_settings FOR UPDATE
  USING (user_id = auth.uid());

-- Add trigger for updated_at
CREATE TRIGGER update_email_settings_updated_at
  BEFORE UPDATE ON public.email_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add index for faster lookups
CREATE INDEX idx_email_settings_user_id ON public.email_settings(user_id);

-- Add email_preferences table if it doesn't exist yet (from previous migration)
CREATE TABLE IF NOT EXISTS public.email_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  rebooking_reminders_enabled BOOLEAN DEFAULT true,
  appointment_reminders_enabled BOOLEAN DEFAULT true,
  marketing_emails_enabled BOOLEAN DEFAULT true,
  unsubscribe_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id)
);
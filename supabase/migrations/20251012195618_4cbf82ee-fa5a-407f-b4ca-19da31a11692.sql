-- Add useful fields for stylist profiles
ALTER TABLE public.stylist_profiles
ADD COLUMN IF NOT EXISTS social_media_instagram TEXT,
ADD COLUMN IF NOT EXISTS social_media_tiktok TEXT,
ADD COLUMN IF NOT EXISTS social_media_facebook TEXT,
ADD COLUMN IF NOT EXISTS preferred_communication TEXT DEFAULT 'app',
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/New_York',
ADD COLUMN IF NOT EXISTS cancellation_policy TEXT,
ADD COLUMN IF NOT EXISTS deposit_required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deposit_percentage NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS accepts_new_clients BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS max_clients_per_day INTEGER DEFAULT 8,
ADD COLUMN IF NOT EXISTS business_phone TEXT,
ADD COLUMN IF NOT EXISTS business_email TEXT,
ADD COLUMN IF NOT EXISTS parking_instructions TEXT,
ADD COLUMN IF NOT EXISTS special_accommodations TEXT;

-- Add useful fields for client profiles  
ALTER TABLE public.client_profiles
ADD COLUMN IF NOT EXISTS birthday DATE,
ADD COLUMN IF NOT EXISTS hair_goals TEXT,
ADD COLUMN IF NOT EXISTS preferred_time_of_day TEXT,
ADD COLUMN IF NOT EXISTS referral_source TEXT,
ADD COLUMN IF NOT EXISTS client_since DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS preferred_stylist_notes TEXT,
ADD COLUMN IF NOT EXISTS sensitivity_notes TEXT,
ADD COLUMN IF NOT EXISTS communication_preference TEXT DEFAULT 'app',
ADD COLUMN IF NOT EXISTS appointment_reminders_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS special_requests TEXT;

-- Add dashboard preferences column to profiles table for storing customization
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS dashboard_preferences JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "push": true}'::jsonb,
ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'system';

-- Create index for faster dashboard preference queries
CREATE INDEX IF NOT EXISTS idx_profiles_dashboard_prefs ON public.profiles USING GIN (dashboard_preferences);

-- Add comments for documentation
COMMENT ON COLUMN stylist_profiles.preferred_communication IS 'Preferred method: app, email, text, call';
COMMENT ON COLUMN stylist_profiles.timezone IS 'Stylist timezone for scheduling';
COMMENT ON COLUMN client_profiles.preferred_time_of_day IS 'Client preference: morning, afternoon, evening';
COMMENT ON COLUMN client_profiles.client_since IS 'Date client first booked with stylist';
COMMENT ON COLUMN profiles.dashboard_preferences IS 'User dashboard layout and widget preferences';
COMMENT ON COLUMN profiles.theme_preference IS 'UI theme: light, dark, or system';
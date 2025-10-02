-- Add weekly schedule column to stylist_profiles
ALTER TABLE public.stylist_profiles 
ADD COLUMN IF NOT EXISTS weekly_schedule JSONB DEFAULT '{
  "monday": {"enabled": true, "startTime": "09:00", "endTime": "17:00"},
  "tuesday": {"enabled": true, "startTime": "09:00", "endTime": "17:00"},
  "wednesday": {"enabled": true, "startTime": "09:00", "endTime": "17:00"},
  "thursday": {"enabled": true, "startTime": "09:00", "endTime": "17:00"},
  "friday": {"enabled": true, "startTime": "09:00", "endTime": "17:00"},
  "saturday": {"enabled": false, "startTime": "10:00", "endTime": "16:00"},
  "sunday": {"enabled": false, "startTime": "10:00", "endTime": "16:00"}
}'::jsonb;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_stylist_profiles_weekly_schedule ON public.stylist_profiles USING gin(weekly_schedule);

COMMENT ON COLUMN public.stylist_profiles.weekly_schedule IS 'Stores stylist weekly working hours as JSON object with day keys';
-- Add per-service buffer time support
ALTER TABLE stylist_services 
ADD COLUMN IF NOT EXISTS buffer_time_minutes integer DEFAULT NULL;

COMMENT ON COLUMN stylist_services.buffer_time_minutes IS 'Optional per-service buffer time. If NULL, uses the stylist default buffer time.';
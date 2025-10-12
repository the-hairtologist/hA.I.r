-- =============================================
-- ENABLE AUTOMATED REMINDERS & REALTIME - FIXED
-- Date: 2025-10-12
-- =============================================

-- 1. Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 3. Schedule automated reminder function to run every hour
-- First, drop if exists to avoid duplicates
SELECT cron.unschedule('send-appointment-reminders') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'send-appointment-reminders'
);

SELECT cron.schedule(
  'send-appointment-reminders',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT net.http_post(
    url := 'https://iyotklwiwyljospfqnoy.supabase.co/functions/v1/automated-reminders',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5b3RrbHdpd3lsam9zcGZxbm95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNTU0NDAsImV4cCI6MjA3NDkzMTQ0MH0.X1bkOZPuNuGeUHYfiN1p8_z8jtRWnfi2T9WlzGOb_jA"}'::jsonb,
    body := concat('{"time": "', now(), '"}')::jsonb
  ) as request_id;
  $$
);

-- 4. Enable realtime for tables (only if not already added)
DO $$
BEGIN
  -- appointments
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'appointments'
  ) THEN
    ALTER TABLE appointments REPLICA IDENTITY FULL;
    ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
  END IF;

  -- messages
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER TABLE messages REPLICA IDENTITY FULL;
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;

  -- client_profiles
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'client_profiles'
  ) THEN
    ALTER TABLE client_profiles REPLICA IDENTITY FULL;
    ALTER PUBLICATION supabase_realtime ADD TABLE client_profiles;
  END IF;

  -- stylist_profiles
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'stylist_profiles'
  ) THEN
    ALTER TABLE stylist_profiles REPLICA IDENTITY FULL;
    ALTER PUBLICATION supabase_realtime ADD TABLE stylist_profiles;
  END IF;

  -- reviews
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'reviews'
  ) THEN
    ALTER TABLE reviews REPLICA IDENTITY FULL;
    ALTER PUBLICATION supabase_realtime ADD TABLE reviews;
  END IF;
END $$;

-- 5. Create function to manually trigger reminders (for testing)
CREATE OR REPLACE FUNCTION trigger_appointment_reminders()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT net.http_post(
    url := 'https://iyotklwiwyljospfqnoy.supabase.co/functions/v1/automated-reminders',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5b3RrbHdpd3lsam9zcGZxbm95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNTU0NDAsImV4cCI6MjA3NDkzMTQ0MH0.X1bkOZPuNuGeUHYfiN1p8_z8jtRWnfi2T9WlzGOb_jA"}'::jsonb,
    body := concat('{"time": "', now(), '"}')::jsonb
  ) INTO result;
  
  RETURN result;
END;
$$;

-- 6. Grant execute permission
GRANT EXECUTE ON FUNCTION trigger_appointment_reminders() TO authenticated;
-- Remove duplicate appointment reminder systems
-- Keep only smart-reminder (better UX with formula history)

-- 1. Unschedule duplicate cron jobs
SELECT cron.unschedule('appointment-reminders-check') 
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'appointment-reminders-check');

SELECT cron.unschedule('send-appointment-reminders') 
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'send-appointment-reminders');

-- 2. Drop the duplicate database function
DROP FUNCTION IF EXISTS public.trigger_appointment_reminders();

-- 3. Ensure smart-reminder is properly scheduled (unschedule first to avoid conflicts)
SELECT cron.unschedule('smart-reminder-daily') 
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'smart-reminder-daily');

-- 4. Schedule smart-reminder fresh
SELECT cron.schedule(
  'smart-reminder-daily',
  '0 9 * * *',
  $cron$
  SELECT net.http_post(
    url := 'https://iyotklwiwyljospfqnoy.supabase.co/functions/v1/smart-reminder',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5b3RrbHdpd3lsam9zcGZxbm95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNTU0NDAsImV4cCI6MjA3NDkzMTQ0MH0.X1bkOZPuNuGeUHYfiN1p8_z8jtRWnfi2T9WlzGOb_jA"}'::jsonb,
    body := concat('{"time": "', now(), '"}')::jsonb
  ) as request_id;
  $cron$
);
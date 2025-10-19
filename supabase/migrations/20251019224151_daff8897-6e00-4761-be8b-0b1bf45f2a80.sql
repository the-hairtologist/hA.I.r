-- Schedule automated-reminders to run every 6 hours
-- This checks for appointments 24-48 hours in advance
SELECT cron.schedule(
  'appointment-reminders-check',
  '0 */6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://iyotklwiwyljospfqnoy.supabase.co/functions/v1/automated-reminders',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5b3RrbHdpd3lsam9zcGZxbm95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNTU0NDAsImV4cCI6MjA3NDkzMTQ0MH0.X1bkOZPuNuGeUHYfiN1p8_z8jtRWnfi2T9WlzGOb_jA"}'::jsonb
  ) as request_id;
  $$
);

-- Schedule smart-reminder (tomorrow's appointments) to run daily at 9 AM
SELECT cron.schedule(
  'smart-reminder-daily',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url := 'https://iyotklwiwyljospfqnoy.supabase.co/functions/v1/smart-reminder',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5b3RrbHdpd3lsam9zcGZxbm95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNTU0NDAsImV4cCI6MjA3NDkzMTQ0MH0.X1bkOZPuNuGeUHYfiN1p8_z8jtRWnfi2T9WlzGOb_jA"}'::jsonb
  ) as request_id;
  $$
);

-- Schedule automated-appointment-followup to run daily at 10 AM
-- This sends review requests and no-show rebooking reminders
SELECT cron.schedule(
  'appointment-followup-daily',
  '0 10 * * *',
  $$
  SELECT net.http_post(
    url := 'https://iyotklwiwyljospfqnoy.supabase.co/functions/v1/automated-appointment-followup',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5b3RrbHdpd3lsam9zcGZxbm95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNTU0NDAsImV4cCI6MjA3NDkzMTQ0MH0.X1bkOZPuNuGeUHYfiN1p8_z8jtRWnfi2T9WlzGOb_jA"}'::jsonb
  ) as request_id;
  $$
);

-- Create a function to view cron job status (useful for monitoring)
CREATE OR REPLACE FUNCTION public.get_cron_job_status()
RETURNS TABLE (
  jobid bigint,
  schedule text,
  command text,
  nodename text,
  nodeport integer,
  database text,
  username text,
  active boolean,
  jobname text
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM cron.job ORDER BY jobid;
$$;

-- Grant execute permission to authenticated users (stylists can check status)
GRANT EXECUTE ON FUNCTION public.get_cron_job_status() TO authenticated;

COMMENT ON FUNCTION public.get_cron_job_status() IS 'Returns the status of all scheduled cron jobs for automation monitoring';
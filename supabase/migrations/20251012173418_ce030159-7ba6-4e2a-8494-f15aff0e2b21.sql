
-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create cron job to run rebooking reminders daily at 9 AM
SELECT cron.schedule(
  'send-daily-rebooking-reminders',
  '0 9 * * *', -- Every day at 9 AM
  $$
  SELECT
    net.http_post(
        url:='https://iyotklwiwyljospfqnoy.supabase.co/functions/v1/send-rebooking-reminder',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5b3RrbHdpd3lsam9zcGZxbm95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNTU0NDAsImV4cCI6MjA3NDkzMTQ0MH0.X1bkOZPuNuGeUHYfiN1p8_z8jtRWnfi2T9WlzGOb_jA"}'::jsonb,
        body:='{"time": "' || now()::text || '"}'::jsonb
    ) as request_id;
  $$
);

-- Grant necessary permissions for cron
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

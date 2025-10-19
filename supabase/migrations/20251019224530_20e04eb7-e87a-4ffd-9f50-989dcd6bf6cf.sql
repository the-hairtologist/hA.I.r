-- Schedule retention-messages edge function to run weekly on Monday at 9 AM
SELECT cron.schedule(
  'weekly-retention-messages'::text,
  '0 9 * * 1'::text,
  $$
  SELECT net.http_post(
    url := 'https://iyotklwiwyljospfqnoy.supabase.co/functions/v1/retention-messages',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5b3RrbHdpd3lsam9zcGZxbm95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNTU0NDAsImV4cCI6MjA3NDkzMTQ0MH0.X1bkOZPuNuGeUHYfiN1p8_z8jtRWnfi2T9WlzGOb_jA"}'::jsonb
  ) as request_id;
  $$::text
);
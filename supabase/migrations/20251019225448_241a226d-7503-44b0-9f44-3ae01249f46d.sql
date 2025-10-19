-- Schedule no-show-prevention to run twice daily (8 AM and 8 PM)
-- This sends 48h and 24h confirmation requests to reduce no-shows
SELECT cron.schedule(
  'no-show-prevention'::text,
  '0 8,20 * * *'::text, -- 8 AM and 8 PM daily
  $$
  SELECT net.http_post(
    url := 'https://iyotklwiwyljospfqnoy.supabase.co/functions/v1/no-show-prevention',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5b3RrbHdpd3lsam9zcGZxbm95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNTU0NDAsImV4cCI6MjA3NDkzMTQ0MH0.X1bkOZPuNuGeUHYfiN1p8_z8jtRWnfi2T9WlzGOb_jA"}'::jsonb
  ) as request_id;
  $$::text
);
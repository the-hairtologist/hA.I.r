-- Fix search_path security issue for get_cron_job_status function
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
SET search_path = public, cron
AS $$
  SELECT * FROM cron.job ORDER BY jobid;
$$;

COMMENT ON FUNCTION public.get_cron_job_status() IS 'Returns the status of all scheduled cron jobs for automation monitoring';
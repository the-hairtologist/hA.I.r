-- ============================================================================
-- DATA RETENTION & CLEANUP POLICIES
-- Automated cleanup of old data to maintain database performance
-- Run these via Lovable Cloud backend or Supabase SQL editor
-- ============================================================================

-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============================================================================
-- 1. ERROR LOGS CLEANUP (Keep 30 days)
-- ============================================================================

-- Delete old error logs daily at 2 AM
SELECT cron.schedule(
  'cleanup-error-logs',
  '0 2 * * *', -- Daily at 2 AM
  $$
  DELETE FROM public.error_logs 
  WHERE created_at < NOW() - INTERVAL '30 days';
  $$
);

-- ============================================================================
-- 2. AUDIT LOGS RETENTION (Keep 90 days)
-- ============================================================================

-- Archive old audit logs weekly
SELECT cron.schedule(
  'archive-old-audit-logs',
  '0 3 * * 0', -- Sunday at 3 AM
  $$
  DELETE FROM public.audit_logs 
  WHERE created_at < NOW() - INTERVAL '90 days';
  $$
);

-- ============================================================================
-- 3. OLD APPOINTMENTS ARCHIVAL (Keep active for 2 years)
-- ============================================================================

-- Mark old appointments as archived (don't delete for compliance)
SELECT cron.schedule(
  'archive-old-appointments',
  '0 4 * * 0', -- Sunday at 4 AM
  $$
  UPDATE public.appointments 
  SET notes = notes || ' [ARCHIVED]'
  WHERE appointment_date < NOW() - INTERVAL '2 years' 
  AND status = 'completed'
  AND notes NOT LIKE '%[ARCHIVED]%';
  $$
);

-- ============================================================================
-- 4. EXPIRED AI INSIGHTS CLEANUP
-- ============================================================================

-- Delete expired AI insights daily
SELECT cron.schedule(
  'cleanup-expired-insights',
  '0 5 * * *', -- Daily at 5 AM
  $$
  DELETE FROM public.ai_insights 
  WHERE expires_at < NOW()
  OR (is_dismissed = true AND dismissed_at < NOW() - INTERVAL '30 days');
  $$
);

-- ============================================================================
-- 5. OLD CHAT MESSAGES CLEANUP (Keep 1 year)
-- ============================================================================

-- Delete old messages (but keep important ones)
SELECT cron.schedule(
  'cleanup-old-messages',
  '0 6 * * 0', -- Sunday at 6 AM
  $$
  DELETE FROM public.messages 
  WHERE created_at < NOW() - INTERVAL '1 year'
  AND read = true;
  $$
);

-- ============================================================================
-- 6. TEMPORARY AI CONVERSATION CLEANUP
-- ============================================================================

-- Delete abandoned AI conversations (no messages in 30 days)
SELECT cron.schedule(
  'cleanup-abandoned-conversations',
  '0 7 * * 0', -- Sunday at 7 AM
  $$
  DELETE FROM public.ai_conversations 
  WHERE updated_at < NOW() - INTERVAL '30 days'
  AND id NOT IN (
    SELECT DISTINCT conversation_id 
    FROM public.ai_conversation_messages 
    WHERE created_at > NOW() - INTERVAL '30 days'
  );
  $$
);

-- ============================================================================
-- 7. OLD NOTIFICATION CLEANUP (Keep 90 days)
-- ============================================================================

-- Clean up old notifications
SELECT cron.schedule(
  'cleanup-old-notifications',
  '0 8 * * *', -- Daily at 8 AM
  $$
  DELETE FROM public.notifications 
  WHERE created_at < NOW() - INTERVAL '90 days'
  AND read = true;
  $$
);

-- ============================================================================
-- 8. ANONYMIZE OLD CLIENT DATA (GDPR Compliance)
-- ============================================================================

-- Anonymize medical info for clients who haven't been seen in 2 years
SELECT cron.schedule(
  'anonymize-old-client-data',
  '0 9 1 * *', -- 1st of month at 9 AM
  $$
  UPDATE public.client_profiles
  SET 
    allergies = '[ARCHIVED - Contact client for current information]',
    notes = '[ARCHIVED - Contact client for current information]'
  WHERE id IN (
    SELECT cp.id
    FROM public.client_profiles cp
    LEFT JOIN LATERAL (
      SELECT MAX(appointment_date) as last_appointment
      FROM public.appointments
      WHERE client_id = cp.id
    ) a ON true
    WHERE 
      (a.last_appointment < NOW() - INTERVAL '2 years' OR a.last_appointment IS NULL)
      AND cp.allergies IS NOT NULL
      AND cp.allergies != '[ARCHIVED - Contact client for current information]'
  );
  $$
);

-- ============================================================================
-- 9. CLEANUP FAILED OFFLINE QUEUE ITEMS
-- ============================================================================

-- Note: Offline queue is in localStorage, but if you move it to DB:
-- DELETE FROM offline_queue WHERE status = 'failed' AND created_at < NOW() - INTERVAL '7 days';

-- ============================================================================
-- 10. DATABASE MAINTENANCE TASKS
-- ============================================================================

-- Run VACUUM and ANALYZE weekly to reclaim space and update statistics
SELECT cron.schedule(
  'weekly-vacuum-analyze',
  '0 2 * * 0', -- Sunday at 2 AM
  $$
  VACUUM ANALYZE;
  $$
);

-- Reindex tables monthly (during low traffic)
SELECT cron.schedule(
  'monthly-reindex',
  '0 3 1 * *', -- 1st of month at 3 AM
  $$
  REINDEX DATABASE postgres;
  $$
);

-- ============================================================================
-- MONITORING & ALERTS
-- ============================================================================

-- Create a function to check database size and alert if > 80% quota
CREATE OR REPLACE FUNCTION check_database_size()
RETURNS void AS $$
DECLARE
  db_size_mb NUMERIC;
  quota_mb NUMERIC := 500; -- Adjust based on your plan
BEGIN
  SELECT pg_database_size(current_database()) / 1024 / 1024 INTO db_size_mb;
  
  IF db_size_mb > (quota_mb * 0.8) THEN
    INSERT INTO error_logs (component, action, error_message, context)
    VALUES (
      'database',
      'size_alert',
      'Database size approaching quota',
      jsonb_build_object('size_mb', db_size_mb, 'quota_mb', quota_mb)
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Check database size daily
SELECT cron.schedule(
  'daily-size-check',
  '0 10 * * *', -- Daily at 10 AM
  $$SELECT check_database_size();$$
);

-- ============================================================================
-- VIEW SCHEDULED JOBS
-- ============================================================================

-- To see all scheduled jobs:
-- SELECT * FROM cron.job;

-- To see job run history:
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;

-- To delete a job:
-- SELECT cron.unschedule('job-name');

-- ============================================================================
-- MANUAL CLEANUP QUERIES (Run as needed)
-- ============================================================================

-- Count old records before deletion
/*
SELECT 
  'error_logs' as table_name,
  COUNT(*) as old_records
FROM error_logs 
WHERE created_at < NOW() - INTERVAL '30 days'
UNION ALL
SELECT 
  'audit_logs',
  COUNT(*)
FROM audit_logs 
WHERE created_at < NOW() - INTERVAL '90 days'
UNION ALL
SELECT 
  'messages',
  COUNT(*)
FROM messages 
WHERE created_at < NOW() - INTERVAL '1 year' AND read = true;
*/

-- Check database size
/*
SELECT 
  pg_size_pretty(pg_database_size(current_database())) as database_size,
  pg_size_pretty(pg_relation_size('appointments')) as appointments_size,
  pg_size_pretty(pg_relation_size('formulas')) as formulas_size,
  pg_size_pretty(pg_relation_size('messages')) as messages_size;
*/

-- Check largest tables
/*
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;
*/

-- ============================================================================
-- NOTES
-- ============================================================================

/*
1. All times are in UTC (adjust for your timezone if needed)
2. Test these jobs on staging before production
3. Monitor job_run_details to ensure jobs complete successfully
4. Keep backups before running aggressive cleanup
5. Adjust retention periods based on business requirements and compliance
6. Some data (payments, legal records) may have longer retention requirements
*/

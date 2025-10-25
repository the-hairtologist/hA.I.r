-- ============================================================================
-- DATABASE PERFORMANCE INDEXES
-- Run these after your app has real data (month 1+)
-- These significantly improve query performance as data grows
-- ============================================================================

-- NOTE: Run via Lovable Cloud backend or Supabase SQL editor
-- IMPORTANT: Create indexes during low-traffic hours (causes brief locks)

-- ============================================================================
-- SAFETY CHECKS - Run these first to verify your environment
-- ============================================================================

-- Check PostgreSQL version (indexes require 9.5+)
-- SELECT version();

-- Verify you're connected to the correct database
-- SELECT current_database(), current_user;

-- Check available storage space (indexes use additional space)
-- SELECT pg_size_pretty(pg_database_size(current_database())) as db_size;

-- ============================================================================
-- PREREQUISITES
-- ============================================================================

-- Ensure these extensions are available (may require superuser):
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;  -- For fuzzy text search
-- CREATE EXTENSION IF NOT EXISTS btree_gin; -- For GIN indexes on scalar types

-- Note: Supabase includes these by default

-- ============================================================================
-- 1. APPOINTMENTS (Most Critical - Heavily Queried)
-- ============================================================================

-- Stylist's appointment calendar (most common query)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_appointments_stylist_date 
  ON public.appointments(stylist_id, appointment_date DESC) 
  WHERE status != 'cancelled';

-- Client's appointment history
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_appointments_client_date 
  ON public.appointments(client_id, appointment_date DESC);

-- Upcoming appointments lookup (dashboard widgets)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_appointments_upcoming 
  ON public.appointments(appointment_date) 
  WHERE status IN ('scheduled', 'confirmed') 
  AND appointment_date >= NOW();

-- Appointment search by status and date range
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_appointments_status_date 
  ON public.appointments(status, appointment_date DESC);

-- ============================================================================
-- 2. FORMULAS (Frequently Accessed for History)
-- ============================================================================

-- Client's formula history (sorted by most recent)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_formulas_client_recent 
  ON public.formulas(client_id, created_at DESC);

-- Stylist's formula library
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_formulas_stylist_recent 
  ON public.formulas(stylist_id, created_at DESC);

-- Full-text search on formula_text (for searching formulas)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_formulas_text_search 
  ON public.formulas USING gin(to_tsvector('english', formula_text));

-- Tags search (if using tags array column)
-- Note: Only create if 'tags' column exists and is array type
-- Check with: \d public.formulas
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_formulas_tags 
  ON public.formulas USING gin(tags)
  WHERE tags IS NOT NULL;

-- ============================================================================
-- 3. MESSAGES (Real-time Chat Performance)
-- ============================================================================

-- Conversation thread (sender + recipient pairing)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_conversation 
  ON public.messages(sender_id, recipient_id, created_at DESC);

-- Unread messages (for notification badges)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_unread 
  ON public.messages(recipient_id, read) 
  WHERE read = false;

-- Recent messages for a user (covering index for faster queries)
-- Note: INCLUDE clause requires PostgreSQL 11+, remove if using older version
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_user_recent 
  ON public.messages(recipient_id, created_at DESC) 
  INCLUDE (sender_id, message_text);

-- ============================================================================
-- 4. USER ROLES (Permission Checks on Every Request)
-- ============================================================================

-- Primary lookup for has_role() function
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_roles_lookup 
  ON public.user_roles(user_id, role);

-- ============================================================================
-- 5. CLIENT PROFILES (Search and Discovery)
-- ============================================================================

-- Stylist's client list (preferred_stylist_id lookup)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_preferred_stylist 
  ON public.client_profiles(preferred_stylist_id) 
  WHERE preferred_stylist_id IS NOT NULL;

-- Full-text search on client names
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_name_search 
  ON public.client_profiles USING gin(to_tsvector('english', full_name));

-- Email lookup (for invite validation)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_email_lookup 
  ON public.client_profiles(email) 
  WHERE email IS NOT NULL;

-- ============================================================================
-- 6. STYLIST PROFILES (Public Discovery)
-- ============================================================================

-- Public stylist listings
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stylists_public 
  ON public.stylist_profiles(is_public_listing, is_available) 
  WHERE is_public_listing = true AND is_available = true;

-- Location-based search (if using location field)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stylists_location 
  ON public.stylist_profiles(location) 
  WHERE location IS NOT NULL AND is_public_listing = true;

-- ============================================================================
-- 7. REVIEWS (Ratings and Feedback)
-- ============================================================================

-- Stylist's reviews (for rating calculations)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_stylist_rating 
  ON public.reviews(stylist_id, rating, created_at DESC);

-- Client's review history
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_client 
  ON public.reviews(client_id, created_at DESC);

-- ============================================================================
-- 8. PORTFOLIO PHOTOS (Gallery Loading)
-- ============================================================================

-- Stylist's portfolio (ordered by display_order)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_portfolio_stylist_order 
  ON public.portfolio_photos(stylist_id, display_order) 
  WHERE display_order IS NOT NULL;

-- ============================================================================
-- 9. AUDIT LOGS (Admin Security Monitoring)
-- ============================================================================

-- Audit log search by user and action
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_user_action 
  ON public.audit_logs(user_id, action, created_at DESC);

-- Recent audit trail (for admin dashboard)
-- Note: Partial index with static date not recommended for rolling time periods
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_recent 
  ON public.audit_logs(created_at DESC);

-- ============================================================================
-- 10. AI CONVERSATIONS (Chat History)
-- ============================================================================

-- User's conversation list
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_conversations_user 
  ON public.ai_conversations(user_id, updated_at DESC);

-- Conversation messages
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_messages_conversation 
  ON public.ai_conversation_messages(conversation_id, created_at ASC);

-- ============================================================================
-- 11. PAYMENTS (Financial Records)
-- ============================================================================

-- Stylist's payment history
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_stylist 
  ON public.payments(stylist_id, created_at DESC);

-- Client's payment history
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_client 
  ON public.payments(client_id, created_at DESC);

-- Pending payments lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_pending 
  ON public.payments(status, created_at DESC) 
  WHERE status = 'pending';

-- ============================================================================
-- PERFORMANCE VERIFICATION QUERIES
-- ============================================================================

-- Run these to verify indexes are being used:
-- EXPLAIN ANALYZE SELECT * FROM appointments WHERE stylist_id = 'xxx' AND appointment_date > NOW();
-- Should show "Index Scan using idx_appointments_stylist_date"

-- Check index sizes (run monthly to monitor growth)
-- SELECT 
--   schemaname, tablename, indexname,
--   pg_size_pretty(pg_relation_size(indexrelid)) as size
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public'
-- ORDER BY pg_relation_size(indexrelid) DESC;

-- ============================================================================
-- MAINTENANCE NOTES
-- ============================================================================

-- 1. CONCURRENTLY keyword prevents locking tables during creation
-- 2. Run ANALYZE after creating indexes to update statistics
-- 3. Monitor slow query log to identify missing indexes
-- 4. Drop unused indexes (check pg_stat_user_indexes.idx_scan = 0)
-- 5. REINDEX CONCURRENTLY if index becomes bloated

-- ============================================================================
-- AUTOMATED MAINTENANCE
-- ============================================================================

-- Note: pg_cron extension required for automated scheduling
-- Enable with: CREATE EXTENSION IF NOT EXISTS pg_cron;
-- Alternative: Use your platform's scheduled jobs (GitHub Actions, cron, etc.)

-- Run ANALYZE weekly to keep query planner stats fresh
-- Uncomment if pg_cron is available:
-- SELECT cron.schedule(
--   'weekly-analyze',
--   '0 2 * * 0', -- 2 AM Sunday
--   $$ANALYZE$$
-- );

-- Alternative: Add this to your deployment scripts or cron jobs:
-- psql -c "ANALYZE;" 

-- Monitor bloated indexes (run monthly)
-- If index size > table size, consider REINDEX CONCURRENTLY

-- ============================================================================
-- INDEX CREATION ERROR HANDLING
-- ============================================================================

-- If any index creation fails:
-- 1. Check if table/column exists: \d table_name
-- 2. Check for existing index: \di index_name  
-- 3. For CONCURRENTLY failures, drop invalid index: DROP INDEX CONCURRENTLY idx_name;
-- 4. Retry without CONCURRENTLY during maintenance window if needed

-- ============================================================================
-- PERFORMANCE MONITORING QUERIES
-- ============================================================================

-- Check which indexes are actually being used:
-- SELECT 
--   schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
-- FROM pg_stat_user_indexes 
-- WHERE schemaname = 'public'
-- ORDER BY idx_scan DESC;

-- Find unused indexes (candidates for removal):
-- SELECT 
--   schemaname, tablename, indexname
-- FROM pg_stat_user_indexes 
-- WHERE schemaname = 'public' AND idx_scan = 0;

-- Check index sizes:
-- SELECT 
--   schemaname, tablename, indexname,
--   pg_size_pretty(pg_relation_size(indexrelid)) as size
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public'
-- ORDER BY pg_relation_size(indexrelid) DESC;

-- ============================================================================
-- POST-CREATION VALIDATION
-- ============================================================================

-- Run this after creating indexes to verify they were created successfully:
-- SELECT 
--   indexname, 
--   indexdef,
--   CASE WHEN indisvalid THEN 'VALID' ELSE 'INVALID' END as status
-- FROM pg_indexes 
-- JOIN pg_index ON pg_indexes.indexname = pg_class.relname
-- JOIN pg_class ON pg_index.indexrelid = pg_class.oid
-- WHERE schemaname = 'public' 
--   AND indexname LIKE 'idx_%'
-- ORDER BY indexname;

-- If any indexes show INVALID status, drop and recreate:
-- DROP INDEX CONCURRENTLY idx_invalid_index_name;
-- Then re-run the CREATE INDEX statement

-- ============================================================================
-- PERFORMANCE IMPACT SUMMARY
-- ============================================================================

-- Expected query performance improvements:
-- 1. Appointment queries: 10-100x faster with date range filters
-- 2. Formula search: 5-50x faster with client/stylist filters  
-- 3. Message threads: 20-200x faster for conversation loading
-- 4. User role checks: 100x faster permission validation
-- 5. Full-text search: 10-1000x faster than LIKE queries

-- Trade-offs:
-- - Increased storage: ~20-30% additional space for indexes
-- - Slower INSERTs: ~10-20% overhead for maintaining indexes
-- - Memory usage: Additional RAM needed for index caching

-- Monitor and adjust based on actual usage patterns in production

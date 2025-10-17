-- ============================================================================
-- DATABASE PERFORMANCE INDEXES
-- Run these after your app has real data (month 1+)
-- These significantly improve query performance as data grows
-- ============================================================================

-- NOTE: Run via Lovable Cloud backend or Supabase SQL editor
-- IMPORTANT: Create indexes during low-traffic hours (causes brief locks)

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

-- Tags search (if using tags array)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_formulas_tags 
  ON public.formulas USING gin(tags);

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

-- Recent messages for a user
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

-- Recent audit trail (last 90 days)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_recent 
  ON public.audit_logs(created_at DESC) 
  WHERE created_at > NOW() - INTERVAL '90 days';

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

-- Run ANALYZE weekly to keep query planner stats fresh
SELECT cron.schedule(
  'weekly-analyze',
  '0 2 * * 0', -- 2 AM Sunday
  $$ANALYZE$$
);

-- Monitor bloated indexes (run monthly)
-- If index size > table size, consider REINDEX CONCURRENTLY

-- ============================================
-- PERFORMANCE OPTIMIZATION: Add Database Indexes (Fixed)
-- ============================================

-- 1. APPOINTMENTS - Most frequently queried table
-- Index for stylist's appointments view
CREATE INDEX IF NOT EXISTS idx_appointments_stylist_date 
ON appointments(stylist_id, appointment_date DESC) 
WHERE status IN ('scheduled', 'confirmed', 'in_progress');

-- Index for client's appointments view
CREATE INDEX IF NOT EXISTS idx_appointments_client_date 
ON appointments(client_id, appointment_date DESC);

-- Index for appointment reminders (daily cron job)
CREATE INDEX IF NOT EXISTS idx_appointments_reminders 
ON appointments(appointment_date, reminder_sent) 
WHERE status IN ('scheduled', 'confirmed');

-- Index for rebooking reminders
CREATE INDEX IF NOT EXISTS idx_appointments_completed_date 
ON appointments(appointment_date, status) 
WHERE status = 'completed' AND rebook_reminder_sent = false;

-- 2. FORMULAS - Client history queries
-- Index for stylist's formula lookup by client
CREATE INDEX IF NOT EXISTS idx_formulas_stylist_client 
ON formulas(stylist_id, client_id, created_at DESC);

-- Index for client's formula history
CREATE INDEX IF NOT EXISTS idx_formulas_client_recent 
ON formulas(client_id, created_at DESC);

-- 3. CLIENT_PROFILES - Stylist dashboard queries
-- Index for preferred stylist relationship
CREATE INDEX IF NOT EXISTS idx_client_profiles_stylist 
ON client_profiles(preferred_stylist_id) 
WHERE preferred_stylist_id IS NOT NULL;

-- Index for client search by email
CREATE INDEX IF NOT EXISTS idx_client_profiles_email 
ON client_profiles(email) 
WHERE email IS NOT NULL;

-- 4. PAYMENTS - Financial tracking
-- Index for stylist's payment history
CREATE INDEX IF NOT EXISTS idx_payments_stylist_date 
ON payments(stylist_id, created_at DESC);

-- Index for client's payment history
CREATE INDEX IF NOT EXISTS idx_payments_client_date 
ON payments(client_id, created_at DESC);

-- 5. SMS_CONVERSATIONS - Message history
-- Index for stylist's SMS threads
CREATE INDEX IF NOT EXISTS idx_sms_stylist_recent 
ON sms_conversations(stylist_id, created_at DESC);

-- Index for client's SMS threads
CREATE INDEX IF NOT EXISTS idx_sms_client_recent 
ON sms_conversations(client_id, created_at DESC);

-- 6. REVIEWS - Stylist ratings
-- Index for calculating average ratings
CREATE INDEX IF NOT EXISTS idx_reviews_stylist_rating 
ON reviews(stylist_id, rating) 
WHERE rating IS NOT NULL;

-- 7. AI_INSIGHTS - Dashboard queries
-- Index for active insights (removed NOW() check for immutability)
CREATE INDEX IF NOT EXISTS idx_ai_insights_active 
ON ai_insights(stylist_id, created_at DESC, is_dismissed);

-- 8. STYLIST_SERVICES - Booking page queries
-- Index for active services
CREATE INDEX IF NOT EXISTS idx_stylist_services_active 
ON stylist_services(stylist_id, is_active) 
WHERE is_active = true;

-- 9. USER_ROLES - Authentication checks (hot path)
-- Index for role lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_lookup 
ON user_roles(user_id, role);

-- 10. AUDIT_LOGS - Admin queries
-- Index for recent audit events
CREATE INDEX IF NOT EXISTS idx_audit_logs_recent 
ON audit_logs(created_at DESC, table_name, action);
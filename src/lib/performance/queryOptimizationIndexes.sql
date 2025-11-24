-- Database Indexes for Performance Optimization
-- These indexes support the optimized query files and improve query performance

-- Appointments indexes
CREATE INDEX IF NOT EXISTS idx_appointments_stylist_date 
ON appointments(stylist_id, appointment_date DESC);

CREATE INDEX IF NOT EXISTS idx_appointments_client_date 
ON appointments(client_id, appointment_date DESC);

CREATE INDEX IF NOT EXISTS idx_appointments_status 
ON appointments(status) 
WHERE status IN ('scheduled', 'confirmed');

-- Client profiles indexes
CREATE INDEX IF NOT EXISTS idx_client_profiles_stylist 
ON client_profiles(preferred_stylist_id);

CREATE INDEX IF NOT EXISTS idx_client_profiles_user 
ON client_profiles(user_id);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_sender 
ON messages(sender_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_recipient 
ON messages(recipient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_unread 
ON messages(recipient_id, is_read) 
WHERE is_read = false;

-- Formulas indexes
CREATE INDEX IF NOT EXISTS idx_formulas_client 
ON formulas(client_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_formulas_stylist 
ON formulas(stylist_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_formulas_tags 
ON formulas USING GIN(tags);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_stylist 
ON payments(stylist_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payments_client 
ON payments(client_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payments_status 
ON payments(status, stylist_id);

-- Commissions indexes
CREATE INDEX IF NOT EXISTS idx_commissions_stylist 
ON commissions(stylist_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_commissions_status 
ON commissions(status, stylist_id);

-- Services indexes
CREATE INDEX IF NOT EXISTS idx_services_stylist 
ON stylist_services(stylist_id, is_active);

-- Affiliate codes indexes
CREATE INDEX IF NOT EXISTS idx_affiliate_codes_stylist 
ON stylist_affiliate_codes(stylist_id, is_active);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_appointments_stylist_status_date 
ON appointments(stylist_id, status, appointment_date DESC);

CREATE INDEX IF NOT EXISTS idx_payments_stylist_status_amount 
ON payments(stylist_id, status, amount DESC);

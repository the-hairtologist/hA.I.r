-- Performance Optimization Indexes
-- These indexes significantly improve query performance for common operations

-- Appointments indexes (supports appointment queries)
CREATE INDEX IF NOT EXISTS idx_appointments_stylist_date 
ON appointments(stylist_id, appointment_date DESC);

CREATE INDEX IF NOT EXISTS idx_appointments_client_date 
ON appointments(client_id, appointment_date DESC);

CREATE INDEX IF NOT EXISTS idx_appointments_status 
ON appointments(status) 
WHERE status IN ('scheduled', 'confirmed');

CREATE INDEX IF NOT EXISTS idx_appointments_stylist_status_date 
ON appointments(stylist_id, status, appointment_date DESC);

-- Client profiles indexes (supports client queries)
CREATE INDEX IF NOT EXISTS idx_client_profiles_stylist 
ON client_profiles(preferred_stylist_id);

CREATE INDEX IF NOT EXISTS idx_client_profiles_user 
ON client_profiles(user_id);

-- Messages indexes (supports message and conversation queries)
CREATE INDEX IF NOT EXISTS idx_messages_sender 
ON messages(sender_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_recipient 
ON messages(recipient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_unread 
ON messages(recipient_id, is_read) 
WHERE is_read = false;

-- Formulas indexes (supports formula queries)
CREATE INDEX IF NOT EXISTS idx_formulas_client 
ON formulas(client_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_formulas_stylist 
ON formulas(stylist_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_formulas_tags 
ON formulas USING GIN(tags);

-- Payments indexes (supports finance queries)
CREATE INDEX IF NOT EXISTS idx_payments_stylist 
ON payments(stylist_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payments_client 
ON payments(client_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payments_status 
ON payments(status, stylist_id);

CREATE INDEX IF NOT EXISTS idx_payments_stylist_status_amount 
ON payments(stylist_id, status, amount DESC);

-- Commissions indexes (supports finance queries)
CREATE INDEX IF NOT EXISTS idx_commissions_stylist 
ON commissions(stylist_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_commissions_status 
ON commissions(status, stylist_id);

-- Services indexes (supports service queries)
CREATE INDEX IF NOT EXISTS idx_services_stylist 
ON stylist_services(stylist_id, is_active);

-- Affiliate codes indexes (supports finance queries)
CREATE INDEX IF NOT EXISTS idx_affiliate_codes_stylist 
ON stylist_affiliate_codes(stylist_id, is_active);

COMMENT ON INDEX idx_appointments_stylist_date IS 'Optimizes appointment queries by stylist and date range';
COMMENT ON INDEX idx_messages_unread IS 'Optimizes unread message count queries';
COMMENT ON INDEX idx_formulas_tags IS 'Optimizes tag-based formula search using GIN index';
COMMENT ON INDEX idx_payments_stylist_status_amount IS 'Optimizes payment filtering and sorting by amount';
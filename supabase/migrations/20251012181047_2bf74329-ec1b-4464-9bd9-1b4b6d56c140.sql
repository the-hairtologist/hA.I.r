-- Feature #8: Database Query Optimization
-- Add indexes for frequently queried columns to improve performance

-- Appointments table indexes
CREATE INDEX IF NOT EXISTS idx_appointments_stylist_date 
  ON appointments(stylist_id, appointment_date DESC);

CREATE INDEX IF NOT EXISTS idx_appointments_client_date 
  ON appointments(client_id, appointment_date DESC);

CREATE INDEX IF NOT EXISTS idx_appointments_status 
  ON appointments(status) WHERE status != 'cancelled';

CREATE INDEX IF NOT EXISTS idx_appointments_reminder_sent 
  ON appointments(reminder_sent, appointment_date) 
  WHERE reminder_sent = false AND status = 'scheduled';

-- Formulas table indexes
CREATE INDEX IF NOT EXISTS idx_formulas_stylist_created 
  ON formulas(stylist_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_formulas_client 
  ON formulas(client_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_formulas_tags 
  ON formulas USING GIN(tags) WHERE tags IS NOT NULL;

-- Messages table indexes
CREATE INDEX IF NOT EXISTS idx_messages_recipient_created 
  ON messages(recipient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_sender_created 
  ON messages(sender_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_unread 
  ON messages(recipient_id, is_read) WHERE is_read = false;

-- Client profiles indexes
CREATE INDEX IF NOT EXISTS idx_client_profiles_stylist 
  ON client_profiles(preferred_stylist_id) 
  WHERE preferred_stylist_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_client_profiles_user 
  ON client_profiles(user_id) WHERE user_id IS NOT NULL;

-- Portfolio photos indexes
CREATE INDEX IF NOT EXISTS idx_portfolio_stylist_order 
  ON portfolio_photos(stylist_id, display_order);

-- Product inventory indexes
CREATE INDEX IF NOT EXISTS idx_product_inventory_stylist 
  ON product_inventory(stylist_id, category);

CREATE INDEX IF NOT EXISTS idx_product_inventory_low_stock 
  ON product_inventory(stylist_id) 
  WHERE current_quantity <= reorder_threshold;

-- Reviews indexes (if reviews table exists)
CREATE INDEX IF NOT EXISTS idx_reviews_stylist_created 
  ON reviews(stylist_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reviews_client 
  ON reviews(client_id, created_at DESC);

-- Add statistics for query planner
ANALYZE appointments;
ANALYZE formulas;
ANALYZE messages;
ANALYZE client_profiles;
ANALYZE portfolio_photos;
ANALYZE product_inventory;
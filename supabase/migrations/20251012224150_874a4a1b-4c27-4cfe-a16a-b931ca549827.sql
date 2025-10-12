-- Performance optimization: Add indexes for calendar queries
-- These indexes will significantly improve appointment query performance

-- Index for appointments by date and status (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_appointments_date_status 
ON appointments(appointment_date, status);

-- Index for client appointments lookups
CREATE INDEX IF NOT EXISTS idx_appointments_client_date 
ON appointments(client_id, appointment_date) 
WHERE status != 'cancelled';

-- Index for stylist appointments lookups
CREATE INDEX IF NOT EXISTS idx_appointments_stylist_date 
ON appointments(stylist_id, appointment_date) 
WHERE status != 'cancelled';

-- Index for week range queries (used in calendar views)
CREATE INDEX IF NOT EXISTS idx_appointments_date_range 
ON appointments(appointment_date DESC) 
WHERE status != 'cancelled';

-- Composite index for stylist + client queries
CREATE INDEX IF NOT EXISTS idx_appointments_stylist_client 
ON appointments(stylist_id, client_id, appointment_date);

-- Add comment explaining the indexes
COMMENT ON INDEX idx_appointments_date_status IS 'Improves calendar queries filtering by date and status';
COMMENT ON INDEX idx_appointments_client_date IS 'Optimizes client dashboard appointment lookups';
COMMENT ON INDEX idx_appointments_stylist_date IS 'Optimizes stylist dashboard appointment lookups';
COMMENT ON INDEX idx_appointments_date_range IS 'Speeds up week/month range queries for calendar views';
COMMENT ON INDEX idx_appointments_stylist_client IS 'Improves queries joining stylist and client data';
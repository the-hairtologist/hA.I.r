-- Create trigger for updating stylist ratings when reviews are added/updated/deleted
CREATE TRIGGER update_stylist_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_stylist_rating();

-- Ensure appointments table has proper index for conflict checking
CREATE INDEX IF NOT EXISTS idx_appointments_stylist_date ON appointments(stylist_id, appointment_date, status);

-- Ensure blocked dates has proper index for quick lookups
CREATE INDEX IF NOT EXISTS idx_blocked_dates_stylist_date ON stylist_blocked_dates(stylist_id, blocked_date);

-- Add index for faster service lookups
CREATE INDEX IF NOT EXISTS idx_stylist_services_active ON stylist_services(stylist_id, is_active) WHERE is_active = true;

-- Enable realtime for appointments so calendar updates automatically
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;

-- Enable realtime for reviews so ratings update instantly
ALTER PUBLICATION supabase_realtime ADD TABLE reviews;
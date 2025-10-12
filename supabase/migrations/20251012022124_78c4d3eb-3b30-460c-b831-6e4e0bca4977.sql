-- Add tags support to formulas table
ALTER TABLE formulas ADD COLUMN IF NOT EXISTS tags text[];

-- Add index for better search performance
CREATE INDEX IF NOT EXISTS idx_formulas_tags ON formulas USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_formulas_client_id ON formulas(client_id);
CREATE INDEX IF NOT EXISTS idx_formulas_stylist_id ON formulas(stylist_id);
CREATE INDEX IF NOT EXISTS idx_formulas_created_at ON formulas(created_at DESC);

-- Add full text search for formulas
CREATE INDEX IF NOT EXISTS idx_formulas_search ON formulas USING GIN(to_tsvector('english', formula_text || ' ' || COALESCE(instructions, '') || ' ' || COALESCE(result_notes, '')));

-- Create a view for client statistics (for quick access to appointment counts and last visit)
CREATE OR REPLACE VIEW client_statistics AS
SELECT 
  cp.id as client_id,
  cp.full_name,
  cp.email,
  cp.phone,
  cp.preferred_stylist_id,
  COUNT(a.id) as total_appointments,
  MAX(a.appointment_date) as last_appointment_date,
  COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_appointments,
  COUNT(CASE WHEN a.appointment_date >= NOW() THEN 1 END) as upcoming_appointments
FROM client_profiles cp
LEFT JOIN appointments a ON a.client_id = cp.id
GROUP BY cp.id, cp.full_name, cp.email, cp.phone, cp.preferred_stylist_id;

-- Grant access to the view
GRANT SELECT ON client_statistics TO authenticated;
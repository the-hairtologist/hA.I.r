-- Add structured fields to formulas table for better organization
ALTER TABLE formulas 
ADD COLUMN processing_time_minutes integer,
ADD COLUMN developer_volume text,
ADD COLUMN application_notes text,
ADD COLUMN what_worked text,
ADD COLUMN what_to_avoid text;

-- Add helpful comments
COMMENT ON COLUMN formulas.processing_time_minutes IS 'Processing time in minutes';
COMMENT ON COLUMN formulas.developer_volume IS 'Developer volume (e.g., 10 vol, 20 vol, 30 vol, 40 vol)';
COMMENT ON COLUMN formulas.application_notes IS 'Notes about how to apply the formula';
COMMENT ON COLUMN formulas.what_worked IS 'What worked well with this formula';
COMMENT ON COLUMN formulas.what_to_avoid IS 'What to avoid next time';

-- Add index for common queries filtering by processing time
CREATE INDEX idx_formulas_processing_time ON formulas(processing_time_minutes) WHERE processing_time_minutes IS NOT NULL;
-- Change default verification status to 'verified' for immediate access
ALTER TABLE stylist_profiles 
ALTER COLUMN verification_status SET DEFAULT 'verified';

-- Update any existing pending stylists to verified (honor system)
UPDATE stylist_profiles 
SET verification_status = 'verified',
    verified_at = NOW()
WHERE verification_status = 'pending';

-- Add comment explaining the honor system approach
COMMENT ON COLUMN stylist_profiles.verification_status IS 'Honor system: defaults to verified. License info collected for records and future background verification if needed.';
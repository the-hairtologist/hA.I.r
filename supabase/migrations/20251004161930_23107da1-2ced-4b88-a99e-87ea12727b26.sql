-- Add tracking columns for automated follow-up emails
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS followup_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS rebook_reminder_sent BOOLEAN DEFAULT false;

-- Add index for efficient queries
CREATE INDEX IF NOT EXISTS idx_appointments_followup_sent ON appointments(followup_sent, status, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_rebook_reminder ON appointments(rebook_reminder_sent, status, appointment_date);

COMMENT ON COLUMN appointments.followup_sent IS 'Tracks if post-appointment review request has been sent';
COMMENT ON COLUMN appointments.rebook_reminder_sent IS 'Tracks if re-booking reminder for no-shows has been sent';
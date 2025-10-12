
-- Create table to track rebooking reminders
CREATE TABLE IF NOT EXISTS rebooking_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  stylist_id UUID NOT NULL REFERENCES stylist_profiles(id) ON DELETE CASCADE,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  reminder_type TEXT NOT NULL DEFAULT 'six_week',
  status TEXT NOT NULL DEFAULT 'sent',
  rebooked BOOLEAN DEFAULT FALSE,
  rebooked_appointment_id UUID REFERENCES appointments(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_appointment_reminder UNIQUE (appointment_id, reminder_type)
);

-- Enable RLS
ALTER TABLE rebooking_reminders ENABLE ROW LEVEL SECURITY;

-- Stylists can view reminders for their appointments
CREATE POLICY "Stylists can view own rebooking reminders"
  ON rebooking_reminders FOR SELECT
  USING (stylist_id IN (
    SELECT id FROM stylist_profiles WHERE user_id = auth.uid()
  ));

-- Clients can view their own reminders
CREATE POLICY "Clients can view own rebooking reminders"
  ON rebooking_reminders FOR SELECT
  USING (client_id IN (
    SELECT id FROM client_profiles WHERE user_id = auth.uid()
  ));

-- System can insert reminders
CREATE POLICY "System can insert rebooking reminders"
  ON rebooking_reminders FOR INSERT
  WITH CHECK (true);

-- System can update reminders
CREATE POLICY "System can update rebooking reminders"
  ON rebooking_reminders FOR UPDATE
  USING (true);

-- Add index for performance
CREATE INDEX idx_rebooking_reminders_appointment ON rebooking_reminders(appointment_id);
CREATE INDEX idx_rebooking_reminders_client ON rebooking_reminders(client_id);
CREATE INDEX idx_rebooking_reminders_sent_at ON rebooking_reminders(sent_at);

-- Create function to check if client needs rebooking reminder
CREATE OR REPLACE FUNCTION needs_rebooking_reminder(appointment_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  appointment_date TIMESTAMP WITH TIME ZONE;
  reminder_exists BOOLEAN;
BEGIN
  -- Get appointment date
  SELECT appointment_date INTO appointment_date
  FROM appointments
  WHERE id = appointment_id_param
    AND status = 'completed';
  
  IF appointment_date IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if 6 weeks have passed
  IF appointment_date < NOW() - INTERVAL '6 weeks' THEN
    -- Check if reminder already sent
    SELECT EXISTS (
      SELECT 1 FROM rebooking_reminders
      WHERE appointment_id = appointment_id_param
        AND reminder_type = 'six_week'
    ) INTO reminder_exists;
    
    RETURN NOT reminder_exists;
  END IF;
  
  RETURN FALSE;
END;
$$;

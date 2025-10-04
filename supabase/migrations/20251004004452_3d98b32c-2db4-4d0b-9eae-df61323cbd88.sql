-- Add buffer time configuration to stylist profiles
ALTER TABLE stylist_profiles 
ADD COLUMN IF NOT EXISTS buffer_time_minutes integer DEFAULT 15 CHECK (buffer_time_minutes >= 0 AND buffer_time_minutes <= 60);

COMMENT ON COLUMN stylist_profiles.buffer_time_minutes IS 'Time buffer between appointments in minutes (0-60)';

-- Add deposit configuration to stylist services
ALTER TABLE stylist_services
ADD COLUMN IF NOT EXISTS require_deposit boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS deposit_amount numeric(10,2) DEFAULT 0 CHECK (deposit_amount >= 0),
ADD COLUMN IF NOT EXISTS deposit_type text DEFAULT 'fixed' CHECK (deposit_type IN ('fixed', 'percentage'));

COMMENT ON COLUMN stylist_services.require_deposit IS 'Whether this service requires a deposit';
COMMENT ON COLUMN stylist_services.deposit_amount IS 'Deposit amount (fixed dollar amount or percentage 0-100)';
COMMENT ON COLUMN stylist_services.deposit_type IS 'Type of deposit: fixed amount or percentage of service price';

-- Update payments table to track deposit information
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS is_deposit boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS remaining_balance numeric(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_type text DEFAULT 'full' CHECK (payment_type IN ('full', 'deposit', 'balance'));

COMMENT ON COLUMN payments.is_deposit IS 'Whether this payment was a deposit';
COMMENT ON COLUMN payments.remaining_balance IS 'Remaining balance after deposit';
COMMENT ON COLUMN payments.payment_type IS 'Type of payment: full, deposit, or balance payment';

-- Create calendar connections table for external calendar sync
CREATE TABLE IF NOT EXISTS calendar_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('google', 'apple', 'outlook')),
  access_token text,
  refresh_token text,
  token_expires_at timestamp with time zone,
  calendar_id text,
  is_active boolean DEFAULT true,
  sync_enabled boolean DEFAULT true,
  last_sync_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, provider)
);

COMMENT ON TABLE calendar_connections IS 'Stores external calendar connections for syncing appointments';

-- Enable RLS on calendar_connections
ALTER TABLE calendar_connections ENABLE ROW LEVEL SECURITY;

-- RLS policies for calendar_connections
CREATE POLICY "Users can manage their own calendar connections"
ON calendar_connections
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create appointment_calendar_events table to track synced events
CREATE TABLE IF NOT EXISTS appointment_calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  calendar_connection_id uuid NOT NULL REFERENCES calendar_connections(id) ON DELETE CASCADE,
  external_event_id text NOT NULL,
  provider text NOT NULL CHECK (provider IN ('google', 'apple', 'outlook')),
  synced_at timestamp with time zone DEFAULT now(),
  last_updated_at timestamp with time zone DEFAULT now(),
  sync_status text DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'failed')),
  error_message text,
  UNIQUE(appointment_id, calendar_connection_id)
);

COMMENT ON TABLE appointment_calendar_events IS 'Tracks which appointments are synced to which external calendars';

-- Enable RLS on appointment_calendar_events
ALTER TABLE appointment_calendar_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for appointment_calendar_events
CREATE POLICY "Users can view their synced calendar events"
ON appointment_calendar_events
FOR SELECT
USING (
  calendar_connection_id IN (
    SELECT id FROM calendar_connections WHERE user_id = auth.uid()
  )
);

CREATE POLICY "System can manage calendar events"
ON appointment_calendar_events
FOR ALL
USING (true)
WITH CHECK (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_calendar_connection_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calendar_connections_updated_at
BEFORE UPDATE ON calendar_connections
FOR EACH ROW
EXECUTE FUNCTION update_calendar_connection_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_calendar_connections_user_id ON calendar_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_connections_provider ON calendar_connections(provider);
CREATE INDEX IF NOT EXISTS idx_appointment_calendar_events_appointment_id ON appointment_calendar_events(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_calendar_events_calendar_connection_id ON appointment_calendar_events(calendar_connection_id);
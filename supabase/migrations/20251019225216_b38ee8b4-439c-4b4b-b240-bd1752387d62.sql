-- Add confirmation tracking for no-show prevention
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS confirmation_requested_48h BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS confirmation_requested_24h BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS confirmed_by_client BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;

COMMENT ON COLUMN public.appointments.confirmation_requested_48h IS 'Track if 48-hour confirmation request was sent';
COMMENT ON COLUMN public.appointments.confirmation_requested_24h IS 'Track if 24-hour confirmation request was sent';
COMMENT ON COLUMN public.appointments.confirmed_by_client IS 'Whether client confirmed attendance';
COMMENT ON COLUMN public.appointments.confirmed_at IS 'When client confirmed the appointment';
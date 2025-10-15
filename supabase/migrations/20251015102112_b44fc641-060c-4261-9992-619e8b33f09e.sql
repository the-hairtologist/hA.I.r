-- Create appointment_timers table for tracking appointment duration
CREATE TABLE IF NOT EXISTS public.appointment_timers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.appointment_timers ENABLE ROW LEVEL SECURITY;

-- Stylists can manage timers for their appointments
CREATE POLICY "Stylists can view their appointment timers"
  ON public.appointment_timers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.appointments a
      JOIN public.stylist_profiles sp ON sp.id = a.stylist_id
      WHERE a.id = appointment_timers.appointment_id
      AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "Stylists can create timers for their appointments"
  ON public.appointment_timers
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.appointments a
      JOIN public.stylist_profiles sp ON sp.id = a.stylist_id
      WHERE a.id = appointment_timers.appointment_id
      AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "Stylists can update their appointment timers"
  ON public.appointment_timers
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.appointments a
      JOIN public.stylist_profiles sp ON sp.id = a.stylist_id
      WHERE a.id = appointment_timers.appointment_id
      AND sp.user_id = auth.uid()
    )
  );

-- Create index for better performance
CREATE INDEX idx_appointment_timers_appointment_id ON public.appointment_timers(appointment_id);
CREATE INDEX idx_appointment_timers_end_time ON public.appointment_timers(end_time) WHERE end_time IS NULL;
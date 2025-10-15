-- Create waitlist table for managing appointment requests
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id UUID NOT NULL REFERENCES public.stylist_profiles(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  preferred_date DATE,
  preferred_time TEXT,
  service_type TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notified_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Stylists can manage their own waitlist
CREATE POLICY "Stylists can view their waitlist"
  ON public.waitlist
  FOR SELECT
  USING (
    stylist_id IN (
      SELECT id FROM public.stylist_profiles
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Stylists can create waitlist entries"
  ON public.waitlist
  FOR INSERT
  WITH CHECK (
    stylist_id IN (
      SELECT id FROM public.stylist_profiles
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Stylists can update their waitlist"
  ON public.waitlist
  FOR UPDATE
  USING (
    stylist_id IN (
      SELECT id FROM public.stylist_profiles
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Stylists can delete their waitlist"
  ON public.waitlist
  FOR DELETE
  USING (
    stylist_id IN (
      SELECT id FROM public.stylist_profiles
      WHERE user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX idx_waitlist_stylist_id ON public.waitlist(stylist_id);
CREATE INDEX idx_waitlist_status ON public.waitlist(status);
CREATE INDEX idx_waitlist_created_at ON public.waitlist(created_at);
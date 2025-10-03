-- Create table for schedule overrides
CREATE TABLE public.stylist_schedule_overrides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stylist_id UUID NOT NULL REFERENCES public.stylist_profiles(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  weekly_schedule JSONB NOT NULL,
  label TEXT,
  is_recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Enable RLS
ALTER TABLE public.stylist_schedule_overrides ENABLE ROW LEVEL SECURITY;

-- Stylists can manage their own schedule overrides
CREATE POLICY "Stylists can manage own schedule overrides"
ON public.stylist_schedule_overrides
FOR ALL
USING (stylist_id IN (
  SELECT id FROM public.stylist_profiles WHERE user_id = auth.uid()
));

-- Clients can view schedule overrides when booking
CREATE POLICY "Anyone can view schedule overrides"
ON public.stylist_schedule_overrides
FOR SELECT
USING (true);

-- Add index for performance
CREATE INDEX idx_schedule_overrides_stylist_dates 
ON public.stylist_schedule_overrides(stylist_id, start_date, end_date);
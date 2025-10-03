-- Enable realtime for messages table
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Create portfolio photos table for stylist galleries
CREATE TABLE IF NOT EXISTS public.portfolio_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id UUID NOT NULL REFERENCES public.stylist_profiles(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT,
  is_before_after BOOLEAN DEFAULT false,
  before_photo_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.portfolio_photos ENABLE ROW LEVEL SECURITY;

-- Anyone can view portfolio photos
CREATE POLICY "Anyone can view portfolio photos"
  ON public.portfolio_photos
  FOR SELECT
  USING (true);

-- Stylists can manage their own portfolio
CREATE POLICY "Stylists can manage own portfolio"
  ON public.portfolio_photos
  FOR ALL
  USING (
    stylist_id IN (
      SELECT id FROM public.stylist_profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    stylist_id IN (
      SELECT id FROM public.stylist_profiles WHERE user_id = auth.uid()
    )
  );

-- Add index for better performance
CREATE INDEX idx_portfolio_photos_stylist ON public.portfolio_photos(stylist_id, display_order);

-- Add trigger for updated_at
CREATE TRIGGER update_portfolio_photos_updated_at
  BEFORE UPDATE ON public.portfolio_photos
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
-- Create table for service type color customization
CREATE TABLE IF NOT EXISTS public.service_type_colors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stylist_id UUID NOT NULL,
  service_type TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'hsl(270 85% 60%)',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(stylist_id, service_type)
);

-- Enable RLS
ALTER TABLE public.service_type_colors ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Stylists can view own service colors"
ON public.service_type_colors
FOR SELECT
USING (stylist_id IN (
  SELECT id FROM stylist_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Stylists can insert own service colors"
ON public.service_type_colors
FOR INSERT
WITH CHECK (stylist_id IN (
  SELECT id FROM stylist_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Stylists can update own service colors"
ON public.service_type_colors
FOR UPDATE
USING (stylist_id IN (
  SELECT id FROM stylist_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Stylists can delete own service colors"
ON public.service_type_colors
FOR DELETE
USING (stylist_id IN (
  SELECT id FROM stylist_profiles WHERE user_id = auth.uid()
));

-- Add trigger for updated_at
CREATE TRIGGER update_service_type_colors_updated_at
BEFORE UPDATE ON public.service_type_colors
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Insert default color schemes for existing stylists
INSERT INTO public.service_type_colors (stylist_id, service_type, color)
SELECT 
  id as stylist_id,
  'Cut & Style' as service_type,
  'hsl(190 95% 55%)' as color
FROM stylist_profiles
ON CONFLICT (stylist_id, service_type) DO NOTHING;

INSERT INTO public.service_type_colors (stylist_id, service_type, color)
SELECT 
  id as stylist_id,
  'Color' as service_type,
  'hsl(270 85% 60%)' as color
FROM stylist_profiles
ON CONFLICT (stylist_id, service_type) DO NOTHING;

INSERT INTO public.service_type_colors (stylist_id, service_type, color)
SELECT 
  id as stylist_id,
  'Treatment' as service_type,
  'hsl(340 90% 65%)' as color
FROM stylist_profiles
ON CONFLICT (stylist_id, service_type) DO NOTHING;
-- Create service_templates table for saving common service combinations
CREATE TABLE IF NOT EXISTS public.service_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id UUID NOT NULL REFERENCES public.stylist_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  services TEXT[] NOT NULL DEFAULT '{}',
  total_duration INTEGER NOT NULL DEFAULT 0,
  total_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_templates ENABLE ROW LEVEL SECURITY;

-- Stylists can manage their own templates
CREATE POLICY "Stylists can view their own templates"
  ON public.service_templates
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.stylist_profiles
      WHERE id = service_templates.stylist_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Stylists can create their own templates"
  ON public.service_templates
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.stylist_profiles
      WHERE id = service_templates.stylist_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Stylists can update their own templates"
  ON public.service_templates
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.stylist_profiles
      WHERE id = service_templates.stylist_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Stylists can delete their own templates"
  ON public.service_templates
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.stylist_profiles
      WHERE id = service_templates.stylist_id
      AND user_id = auth.uid()
    )
  );

-- Create index for better performance
CREATE INDEX idx_service_templates_stylist_id ON public.service_templates(stylist_id);
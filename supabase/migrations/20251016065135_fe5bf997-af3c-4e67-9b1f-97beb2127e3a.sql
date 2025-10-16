-- Add trial_end_date and booking_page_active columns to stylist_profiles
ALTER TABLE public.stylist_profiles 
ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS booking_page_active BOOLEAN DEFAULT false;

-- Create zapier_webhooks table for Zapier integration
CREATE TABLE IF NOT EXISTS public.zapier_webhooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stylist_id UUID NOT NULL REFERENCES public.stylist_profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  webhook_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on zapier_webhooks
ALTER TABLE public.zapier_webhooks ENABLE ROW LEVEL SECURITY;

-- Create policies for zapier_webhooks
CREATE POLICY "Stylists can view their own webhooks"
ON public.zapier_webhooks
FOR SELECT
USING (
  stylist_id IN (
    SELECT id FROM public.stylist_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Stylists can create their own webhooks"
ON public.zapier_webhooks
FOR INSERT
WITH CHECK (
  stylist_id IN (
    SELECT id FROM public.stylist_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Stylists can update their own webhooks"
ON public.zapier_webhooks
FOR UPDATE
USING (
  stylist_id IN (
    SELECT id FROM public.stylist_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Stylists can delete their own webhooks"
ON public.zapier_webhooks
FOR DELETE
USING (
  stylist_id IN (
    SELECT id FROM public.stylist_profiles WHERE user_id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_zapier_webhooks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_zapier_webhooks_updated_at
BEFORE UPDATE ON public.zapier_webhooks
FOR EACH ROW
EXECUTE FUNCTION public.update_zapier_webhooks_updated_at();
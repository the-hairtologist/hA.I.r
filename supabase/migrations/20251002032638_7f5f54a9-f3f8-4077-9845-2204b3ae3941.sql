-- Create hair brands table
CREATE TABLE public.hair_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  base_commission_rate NUMERIC NOT NULL DEFAULT 0.10,
  affiliate_program_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stylist affiliate codes table
CREATE TABLE public.stylist_affiliate_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id UUID NOT NULL REFERENCES public.stylist_profiles(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES public.hair_brands(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  affiliate_link TEXT,
  custom_commission_rate NUMERIC,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(stylist_id, brand_id)
);

-- Update commissions table to support brand tracking
ALTER TABLE public.commissions 
  ADD COLUMN brand_id UUID REFERENCES public.hair_brands(id),
  ADD COLUMN referral_code_used TEXT,
  ADD COLUMN purchase_date DATE;

-- Enable RLS
ALTER TABLE public.hair_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stylist_affiliate_codes ENABLE ROW LEVEL SECURITY;

-- RLS policies for hair_brands
CREATE POLICY "Anyone can view active brands"
  ON public.hair_brands FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage brands"
  ON public.hair_brands FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS policies for stylist_affiliate_codes
CREATE POLICY "Stylists can view own codes"
  ON public.stylist_affiliate_codes FOR SELECT
  USING (stylist_id IN (
    SELECT id FROM stylist_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Stylists can create own codes"
  ON public.stylist_affiliate_codes FOR INSERT
  WITH CHECK (stylist_id IN (
    SELECT id FROM stylist_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Stylists can update own codes"
  ON public.stylist_affiliate_codes FOR UPDATE
  USING (stylist_id IN (
    SELECT id FROM stylist_profiles WHERE user_id = auth.uid()
  ));

-- Update commissions RLS policies
DROP POLICY IF EXISTS "Stylists can view own commissions" ON public.commissions;
DROP POLICY IF EXISTS "System can create commissions" ON public.commissions;

CREATE POLICY "Stylists can view own commissions"
  ON public.commissions FOR SELECT
  USING (stylist_id IN (
    SELECT id FROM stylist_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Stylists can create own commissions"
  ON public.commissions FOR INSERT
  WITH CHECK (stylist_id IN (
    SELECT id FROM stylist_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Stylists can update own commissions"
  ON public.commissions FOR UPDATE
  USING (stylist_id IN (
    SELECT id FROM stylist_profiles WHERE user_id = auth.uid()
  ));

-- Insert some popular hair brands
INSERT INTO public.hair_brands (name, base_commission_rate, affiliate_program_url) VALUES
  ('Olaplex', 0.10, 'https://olaplex.com'),
  ('Redken', 0.08, 'https://redken.com'),
  ('Kerastase', 0.12, 'https://kerastase.com'),
  ('Moroccan Oil', 0.10, 'https://moroccanoil.com'),
  ('Paul Mitchell', 0.08, 'https://paulmitchell.com');
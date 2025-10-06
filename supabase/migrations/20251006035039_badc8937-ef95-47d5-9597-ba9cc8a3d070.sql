-- Create referral system tables
CREATE TABLE IF NOT EXISTS public.stylist_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id UUID NOT NULL REFERENCES stylist_profiles(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL UNIQUE,
  referred_by UUID REFERENCES stylist_profiles(id) ON DELETE SET NULL,
  successful_referrals INTEGER DEFAULT 0,
  reward_tier TEXT DEFAULT 'none',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Track individual referrals
CREATE TABLE IF NOT EXISTS public.referral_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES stylist_profiles(id) ON DELETE CASCADE,
  referred_stylist_id UUID NOT NULL REFERENCES stylist_profiles(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  signup_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_qualified BOOLEAN DEFAULT FALSE,
  qualified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Track client milestones for celebrations
CREATE TABLE IF NOT EXISTS public.client_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  stylist_id UUID NOT NULL REFERENCES stylist_profiles(id) ON DELETE CASCADE,
  milestone_type TEXT NOT NULL,
  milestone_value INTEGER NOT NULL,
  celebrated BOOLEAN DEFAULT FALSE,
  discount_code TEXT,
  discount_amount DECIMAL(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(client_id, milestone_type, milestone_value)
);

-- Enable RLS
ALTER TABLE public.stylist_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_milestones ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stylist_referrals
CREATE POLICY "Stylists can view their own referral data"
  ON public.stylist_referrals FOR SELECT
  USING (
    stylist_id IN (
      SELECT id FROM stylist_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Stylists can insert their referral code"
  ON public.stylist_referrals FOR INSERT
  WITH CHECK (
    stylist_id IN (
      SELECT id FROM stylist_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Stylists can update their referral data"
  ON public.stylist_referrals FOR UPDATE
  USING (
    stylist_id IN (
      SELECT id FROM stylist_profiles WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for referral_tracking
CREATE POLICY "Users can view their referral tracking"
  ON public.referral_tracking FOR SELECT
  USING (
    referrer_id IN (
      SELECT id FROM stylist_profiles WHERE user_id = auth.uid()
    )
    OR referred_stylist_id IN (
      SELECT id FROM stylist_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert referral tracking"
  ON public.referral_tracking FOR INSERT
  WITH CHECK (true);

-- RLS Policies for client_milestones
CREATE POLICY "Stylists can view milestones for their clients"
  ON public.client_milestones FOR SELECT
  USING (
    stylist_id IN (
      SELECT id FROM stylist_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage milestones"
  ON public.client_milestones FOR ALL
  USING (true)
  WITH CHECK (true);

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code(stylist_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_code TEXT;
  final_code TEXT;
  counter INTEGER := 0;
BEGIN
  -- Create base code from stylist name (first 4 letters + random 4 digits)
  base_code := UPPER(SUBSTRING(REGEXP_REPLACE(stylist_name, '[^a-zA-Z]', '', 'g'), 1, 4));
  
  LOOP
    final_code := base_code || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM stylist_referrals WHERE referral_code = final_code
    );
    
    counter := counter + 1;
    IF counter > 100 THEN
      RAISE EXCEPTION 'Could not generate unique referral code';
    END IF;
  END LOOP;
  
  RETURN final_code;
END;
$$;

-- Function to check and create milestones
CREATE OR REPLACE FUNCTION check_client_milestones(p_client_id UUID, p_stylist_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  appointment_count INTEGER;
  first_appointment_date TIMESTAMPTZ;
  years_with_stylist INTEGER;
BEGIN
  -- Count appointments
  SELECT COUNT(*), MIN(appointment_date)
  INTO appointment_count, first_appointment_date
  FROM appointments
  WHERE client_id = p_client_id
    AND stylist_id = p_stylist_id
    AND status = 'completed';
  
  -- Check appointment count milestones
  IF appointment_count IN (5, 10, 25, 50, 100) THEN
    INSERT INTO client_milestones (
      client_id,
      stylist_id,
      milestone_type,
      milestone_value,
      discount_code,
      discount_amount
    )
    VALUES (
      p_client_id,
      p_stylist_id,
      'appointments',
      appointment_count,
      'MILESTONE' || appointment_count || '-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8),
      CASE 
        WHEN appointment_count = 5 THEN 10.00
        WHEN appointment_count = 10 THEN 15.00
        WHEN appointment_count = 25 THEN 25.00
        WHEN appointment_count = 50 THEN 50.00
        WHEN appointment_count = 100 THEN 100.00
      END
    )
    ON CONFLICT (client_id, milestone_type, milestone_value) DO NOTHING;
  END IF;
  
  -- Check anniversary milestones (1 year, 2 years, etc.)
  IF first_appointment_date IS NOT NULL THEN
    years_with_stylist := EXTRACT(YEAR FROM AGE(NOW(), first_appointment_date))::INTEGER;
    
    IF years_with_stylist > 0 THEN
      INSERT INTO client_milestones (
        client_id,
        stylist_id,
        milestone_type,
        milestone_value,
        discount_code,
        discount_amount
      )
      VALUES (
        p_client_id,
        p_stylist_id,
        'anniversary',
        years_with_stylist,
        'YEAR' || years_with_stylist || '-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8),
        years_with_stylist * 20.00
      )
      ON CONFLICT (client_id, milestone_type, milestone_value) DO NOTHING;
    END IF;
  END IF;
END;
$$;

-- Trigger to check milestones after appointment completion
CREATE OR REPLACE FUNCTION trigger_check_milestones()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    PERFORM check_client_milestones(NEW.client_id, NEW.stylist_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_milestones_after_appointment
  AFTER INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_check_milestones();

-- Update timestamps
CREATE TRIGGER update_stylist_referrals_updated_at
  BEFORE UPDATE ON public.stylist_referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_stylist_referrals_code ON public.stylist_referrals(referral_code);
CREATE INDEX idx_referral_tracking_referrer ON public.referral_tracking(referrer_id);
CREATE INDEX idx_client_milestones_client ON public.client_milestones(client_id);
CREATE INDEX idx_client_milestones_celebrated ON public.client_milestones(celebrated) WHERE celebrated = false;
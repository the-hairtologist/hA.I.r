-- Create access codes table
CREATE TABLE public.access_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  used_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.access_codes ENABLE ROW LEVEL SECURITY;

-- Admins can manage access codes
CREATE POLICY "Admins can manage access codes"
ON public.access_codes
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Users can view their own used code
CREATE POLICY "Users can view their own access code"
ON public.access_codes
FOR SELECT
USING (used_by = auth.uid());

-- Anyone can check if a code exists and is unused (for redemption)
CREATE POLICY "Anyone can validate unused codes"
ON public.access_codes
FOR SELECT
USING (used_by IS NULL AND is_active = true);

-- Function to redeem an access code
CREATE OR REPLACE FUNCTION public.redeem_access_code(_code TEXT, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code_id UUID;
  v_used_count INTEGER;
BEGIN
  -- Check total number of used codes (limit to 5)
  SELECT COUNT(*) INTO v_used_count
  FROM access_codes
  WHERE used_by IS NOT NULL;
  
  IF v_used_count >= 5 THEN
    RAISE EXCEPTION 'All access codes have been used';
  END IF;
  
  -- Check if user already has an access code
  IF EXISTS (SELECT 1 FROM access_codes WHERE used_by = _user_id) THEN
    RAISE EXCEPTION 'You have already used an access code';
  END IF;
  
  -- Try to redeem the code
  UPDATE access_codes
  SET used_by = _user_id, used_at = NOW()
  WHERE code = _code
    AND used_by IS NULL
    AND is_active = true
  RETURNING id INTO v_code_id;
  
  IF v_code_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or already used access code';
  END IF;
  
  RETURN true;
END;
$$;

-- Insert 5 initial access codes
INSERT INTO public.access_codes (code, notes) VALUES
  (encode(gen_random_bytes(6), 'hex'), 'Initial access code 1'),
  (encode(gen_random_bytes(6), 'hex'), 'Initial access code 2'),
  (encode(gen_random_bytes(6), 'hex'), 'Initial access code 3'),
  (encode(gen_random_bytes(6), 'hex'), 'Initial access code 4'),
  (encode(gen_random_bytes(6), 'hex'), 'Initial access code 5');
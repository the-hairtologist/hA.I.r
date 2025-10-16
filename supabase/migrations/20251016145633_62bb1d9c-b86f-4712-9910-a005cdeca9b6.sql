-- Fix security definer function missing search_path
-- This prevents potential SQL injection through search_path manipulation

-- Update calculate_retention_score function to include search_path
CREATE OR REPLACE FUNCTION public.calculate_retention_score(p_client_id uuid, p_stylist_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_days_since_last INTEGER;
  v_total_visits INTEGER;
  v_avg_frequency INTEGER;
  v_score INTEGER;
BEGIN
  -- Get days since last visit
  SELECT 
    EXTRACT(DAY FROM NOW() - MAX(appointment_date))::INTEGER,
    COUNT(*),
    AVG(EXTRACT(DAY FROM appointment_date - LAG(appointment_date) OVER (ORDER BY appointment_date)))::INTEGER
  INTO v_days_since_last, v_total_visits, v_avg_frequency
  FROM public.appointments
  WHERE client_id = p_client_id
    AND stylist_id = p_stylist_id
    AND status = 'completed';
  
  -- Calculate base score
  v_score := 100;
  
  -- Penalize for days since last visit
  IF v_days_since_last IS NOT NULL THEN
    IF v_days_since_last > 120 THEN
      v_score := v_score - 40;
    ELSIF v_days_since_last > 90 THEN
      v_score := v_score - 30;
    ELSIF v_days_since_last > 60 THEN
      v_score := v_score - 20;
    END IF;
  ELSE
    v_score := v_score - 50; -- Never visited
  END IF;
  
  -- Reward for visit frequency
  IF v_total_visits >= 10 THEN
    v_score := v_score + 15;
  ELSIF v_total_visits >= 5 THEN
    v_score := v_score + 10;
  END IF;
  
  -- Ensure score is between 0 and 100
  v_score := GREATEST(0, LEAST(100, v_score));
  
  RETURN v_score;
END;
$$;
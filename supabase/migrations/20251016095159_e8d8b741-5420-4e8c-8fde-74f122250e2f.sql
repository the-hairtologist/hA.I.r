-- ============================================
-- PHASE 2: Advanced AI Features Infrastructure
-- ============================================

-- Client retention scoring table
CREATE TABLE IF NOT EXISTS public.client_retention_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.client_profiles(id) ON DELETE CASCADE NOT NULL,
  stylist_id UUID REFERENCES public.stylist_profiles(id) ON DELETE CASCADE NOT NULL,
  retention_score INTEGER NOT NULL CHECK (retention_score >= 0 AND retention_score <= 100),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  days_since_last_visit INTEGER,
  total_visits INTEGER DEFAULT 0,
  average_visit_frequency INTEGER, -- days between visits
  last_purchase_amount DECIMAL(10,2),
  engagement_score INTEGER CHECK (engagement_score >= 0 AND engagement_score <= 100),
  predicted_next_visit DATE,
  churn_probability DECIMAL(5,2) CHECK (churn_probability >= 0 AND churn_probability <= 100),
  recommended_actions JSONB,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(client_id, stylist_id)
);

ALTER TABLE public.client_retention_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stylists can view retention scores for their clients"
ON public.client_retention_scores
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.stylist_profiles sp
    WHERE sp.user_id = auth.uid()
    AND sp.id = client_retention_scores.stylist_id
  )
);

-- AI-generated insights table
CREATE TABLE IF NOT EXISTS public.ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id UUID REFERENCES public.stylist_profiles(id) ON DELETE CASCADE NOT NULL,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('retention', 'revenue', 'scheduling', 'inventory', 'client_preference')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  action_items JSONB,
  affected_clients UUID[],
  potential_revenue DECIMAL(10,2),
  confidence_score DECIMAL(5,2) CHECK (confidence_score >= 0 AND confidence_score <= 100),
  is_dismissed BOOLEAN DEFAULT false,
  dismissed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stylists can view their own insights"
ON public.ai_insights
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.stylist_profiles sp
    WHERE sp.user_id = auth.uid()
    AND sp.id = ai_insights.stylist_id
  )
);

CREATE POLICY "Stylists can update their insights"
ON public.ai_insights
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.stylist_profiles sp
    WHERE sp.user_id = auth.uid()
    AND sp.id = ai_insights.stylist_id
  )
);

-- Automated follow-up suggestions
CREATE TABLE IF NOT EXISTS public.automated_followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id UUID REFERENCES public.stylist_profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.client_profiles(id) ON DELETE CASCADE NOT NULL,
  followup_type TEXT NOT NULL CHECK (followup_type IN ('post_appointment', 'retention', 'birthday', 'product_recommendation', 'review_request')),
  suggested_message TEXT NOT NULL,
  send_after TIMESTAMPTZ NOT NULL,
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  is_sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ,
  is_scheduled BOOLEAN DEFAULT false,
  scheduled_at TIMESTAMPTZ,
  response_received BOOLEAN DEFAULT false,
  response_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.automated_followups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stylists can manage their followups"
ON public.automated_followups
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.stylist_profiles sp
    WHERE sp.user_id = auth.uid()
    AND sp.id = automated_followups.stylist_id
  )
);

-- Inventory predictions
CREATE TABLE IF NOT EXISTS public.inventory_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id UUID REFERENCES public.stylist_profiles(id) ON DELETE CASCADE NOT NULL,
  product_name TEXT NOT NULL,
  current_stock INTEGER DEFAULT 0,
  predicted_usage_rate DECIMAL(10,2), -- units per week
  days_until_restock INTEGER,
  restock_recommended_at DATE,
  confidence_score DECIMAL(5,2) CHECK (confidence_score >= 0 AND confidence_score <= 100),
  based_on_appointments INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.inventory_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stylists can view their inventory predictions"
ON public.inventory_predictions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.stylist_profiles sp
    WHERE sp.user_id = auth.uid()
    AND sp.id = inventory_predictions.stylist_id
  )
);

-- Revenue forecasting
CREATE TABLE IF NOT EXISTS public.revenue_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id UUID REFERENCES public.stylist_profiles(id) ON DELETE CASCADE NOT NULL,
  forecast_period TEXT NOT NULL CHECK (forecast_period IN ('week', 'month', 'quarter', 'year')),
  forecast_start DATE NOT NULL,
  forecast_end DATE NOT NULL,
  predicted_revenue DECIMAL(10,2) NOT NULL,
  confidence_interval_low DECIMAL(10,2),
  confidence_interval_high DECIMAL(10,2),
  predicted_appointments INTEGER,
  predicted_new_clients INTEGER,
  predicted_retention_rate DECIMAL(5,2),
  factors JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.revenue_forecasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stylists can view their revenue forecasts"
ON public.revenue_forecasts
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.stylist_profiles sp
    WHERE sp.user_id = auth.uid()
    AND sp.id = revenue_forecasts.stylist_id
  )
);

-- Create indexes for performance
CREATE INDEX idx_retention_scores_stylist ON public.client_retention_scores(stylist_id);
CREATE INDEX idx_retention_scores_risk ON public.client_retention_scores(risk_level);
CREATE INDEX idx_retention_scores_score ON public.client_retention_scores(retention_score);
CREATE INDEX idx_ai_insights_stylist ON public.ai_insights(stylist_id);
CREATE INDEX idx_ai_insights_priority ON public.ai_insights(priority, created_at DESC);
CREATE INDEX idx_ai_insights_type ON public.ai_insights(insight_type);
CREATE INDEX idx_followups_stylist ON public.automated_followups(stylist_id);
CREATE INDEX idx_followups_scheduled ON public.automated_followups(is_scheduled, send_after);
CREATE INDEX idx_inventory_predictions_stylist ON public.inventory_predictions(stylist_id);
CREATE INDEX idx_revenue_forecasts_stylist ON public.revenue_forecasts(stylist_id);

-- Create function to calculate retention score
CREATE OR REPLACE FUNCTION public.calculate_retention_score(
  p_client_id UUID,
  p_stylist_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
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

COMMENT ON TABLE public.client_retention_scores IS 'AI-calculated retention scores for clients';
COMMENT ON TABLE public.ai_insights IS 'AI-generated business insights for stylists';
COMMENT ON TABLE public.automated_followups IS 'Automated client follow-up suggestions';
COMMENT ON TABLE public.inventory_predictions IS 'AI predictions for inventory management';
COMMENT ON TABLE public.revenue_forecasts IS 'Revenue forecasting based on historical data and trends';
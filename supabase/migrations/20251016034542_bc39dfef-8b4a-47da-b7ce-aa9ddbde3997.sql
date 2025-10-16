-- Phase 1, 2, 3: Complete AI Enhancement Database Schema

-- Table 1: Formula Validations (Phase 1)
CREATE TABLE IF NOT EXISTS public.formula_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  formula_content JSONB NOT NULL,
  validation_result JSONB NOT NULL,
  warnings TEXT[],
  blockers TEXT[],
  is_safe BOOLEAN NOT NULL,
  validated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_formula_validations_user_id ON public.formula_validations(user_id);
CREATE INDEX idx_formula_validations_is_safe ON public.formula_validations(is_safe);
CREATE INDEX idx_formula_validations_created_at ON public.formula_validations(created_at);

ALTER TABLE public.formula_validations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own validations"
  ON public.formula_validations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own validations"
  ON public.formula_validations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Table 2: Hair Analysis Results (Phase 1)
CREATE TABLE IF NOT EXISTS public.hair_analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.client_profiles(id) ON DELETE SET NULL,
  image_url TEXT NOT NULL,
  analysis_result JSONB NOT NULL,
  confidence_scores JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_hair_analysis_user_id ON public.hair_analysis_results(user_id);
CREATE INDEX idx_hair_analysis_client_id ON public.hair_analysis_results(client_id);
CREATE INDEX idx_hair_analysis_created_at ON public.hair_analysis_results(created_at);

ALTER TABLE public.hair_analysis_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analyses"
  ON public.hair_analysis_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses"
  ON public.hair_analysis_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Table 3: AI Model Performance (Phase 1)
CREATE TABLE IF NOT EXISTS public.ai_model_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  query_text TEXT NOT NULL,
  query_type TEXT,
  model_used TEXT NOT NULL,
  response_time_ms INTEGER,
  tokens_used INTEGER,
  user_satisfaction INTEGER CHECK (user_satisfaction >= 1 AND user_satisfaction <= 5),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_model_perf_user_id ON public.ai_model_performance(user_id);
CREATE INDEX idx_model_perf_model_used ON public.ai_model_performance(model_used);
CREATE INDEX idx_model_perf_created_at ON public.ai_model_performance(created_at);

ALTER TABLE public.ai_model_performance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own performance data"
  ON public.ai_model_performance FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert performance data"
  ON public.ai_model_performance FOR INSERT
  WITH CHECK (true);

-- Table 4: Cached Formulas (Phase 2)
CREATE TABLE IF NOT EXISTS public.cached_formulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  current_level INTEGER NOT NULL CHECK (current_level >= 1 AND current_level <= 10),
  target_level INTEGER NOT NULL CHECK (target_level >= 1 AND target_level <= 10),
  tone TEXT NOT NULL,
  condition TEXT NOT NULL,
  formula_json JSONB NOT NULL,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(current_level, target_level, tone, condition)
);

CREATE INDEX idx_cached_formulas_lookup ON public.cached_formulas(current_level, target_level, tone, condition);
CREATE INDEX idx_cached_formulas_usage ON public.cached_formulas(usage_count DESC);

ALTER TABLE public.cached_formulas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view cached formulas"
  ON public.cached_formulas FOR SELECT
  USING (true);

CREATE POLICY "System can manage cached formulas"
  ON public.cached_formulas FOR ALL
  USING (true)
  WITH CHECK (true);

-- Table 5: Formula Outcomes (Phase 2)
CREATE TABLE IF NOT EXISTS public.formula_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  formula_id UUID REFERENCES public.formulas(id) ON DELETE CASCADE,
  conversation_message_id UUID REFERENCES public.ai_conversation_messages(id) ON DELETE SET NULL,
  stylist_id UUID REFERENCES public.stylist_profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.client_profiles(id) ON DELETE SET NULL,
  outcome_rating TEXT CHECK (outcome_rating IN ('perfect', 'good', 'okay', 'poor')),
  outcome_notes TEXT,
  what_worked TEXT,
  what_didnt_work TEXT,
  would_use_again BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_formula_outcomes_stylist ON public.formula_outcomes(stylist_id);
CREATE INDEX idx_formula_outcomes_rating ON public.formula_outcomes(outcome_rating);
CREATE INDEX idx_formula_outcomes_created_at ON public.formula_outcomes(created_at);

ALTER TABLE public.formula_outcomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stylists can view own outcomes"
  ON public.formula_outcomes FOR SELECT
  USING (stylist_id IN (SELECT id FROM stylist_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Stylists can insert own outcomes"
  ON public.formula_outcomes FOR INSERT
  WITH CHECK (stylist_id IN (SELECT id FROM stylist_profiles WHERE user_id = auth.uid()));

-- Table 6: Stylist Formula History (Phase 3)
CREATE TABLE IF NOT EXISTS public.stylist_formula_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id UUID REFERENCES public.stylist_profiles(id) ON DELETE CASCADE,
  formula_json JSONB NOT NULL,
  client_id UUID REFERENCES public.client_profiles(id) ON DELETE SET NULL,
  outcome_rating TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_stylist_history_stylist ON public.stylist_formula_history(stylist_id);
CREATE INDEX idx_stylist_history_created_at ON public.stylist_formula_history(created_at);

ALTER TABLE public.stylist_formula_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stylists can view own history"
  ON public.stylist_formula_history FOR SELECT
  USING (stylist_id IN (SELECT id FROM stylist_profiles WHERE user_id = auth.uid()));

CREATE POLICY "System can insert history"
  ON public.stylist_formula_history FOR INSERT
  WITH CHECK (true);

-- Table 7: Stylist Preferences (Phase 3)
CREATE TABLE IF NOT EXISTS public.stylist_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id UUID REFERENCES public.stylist_profiles(id) ON DELETE CASCADE UNIQUE,
  preferred_brands JSONB DEFAULT '[]'::jsonb,
  typical_developer_volumes JSONB DEFAULT '[]'::jsonb,
  processing_time_tendency TEXT,
  tone_adjustment_style TEXT,
  formula_patterns JSONB DEFAULT '{}'::jsonb,
  last_analyzed_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_stylist_prefs_stylist ON public.stylist_preferences(stylist_id);

ALTER TABLE public.stylist_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stylists can view own preferences"
  ON public.stylist_preferences FOR SELECT
  USING (stylist_id IN (SELECT id FROM stylist_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Stylists can update own preferences"
  ON public.stylist_preferences FOR UPDATE
  USING (stylist_id IN (SELECT id FROM stylist_profiles WHERE user_id = auth.uid()));

CREATE POLICY "System can insert preferences"
  ON public.stylist_preferences FOR INSERT
  WITH CHECK (true);

-- Table 8: Predictive Insights (Phase 3)
CREATE TABLE IF NOT EXISTS public.predictive_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id UUID REFERENCES public.stylist_profiles(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL,
  insight_data JSONB NOT NULL,
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days')
);

CREATE INDEX idx_predictive_stylist ON public.predictive_insights(stylist_id);
CREATE INDEX idx_predictive_expires ON public.predictive_insights(expires_at);
CREATE INDEX idx_predictive_created_at ON public.predictive_insights(created_at);

ALTER TABLE public.predictive_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stylists can view own insights"
  ON public.predictive_insights FOR SELECT
  USING (
    stylist_id IN (SELECT id FROM stylist_profiles WHERE user_id = auth.uid()) 
    AND expires_at > now()
  );

CREATE POLICY "System can manage insights"
  ON public.predictive_insights FOR ALL
  USING (true)
  WITH CHECK (true);

-- Cleanup expired insights automatically
CREATE OR REPLACE FUNCTION cleanup_expired_insights()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM predictive_insights WHERE expires_at < now();
END;
$$;
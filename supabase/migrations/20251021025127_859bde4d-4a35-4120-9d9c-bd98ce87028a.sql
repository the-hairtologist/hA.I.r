-- Create comprehensive A/B testing schema with micro-conversion tracking

-- Experiments table
CREATE TABLE IF NOT EXISTS public.ab_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ
);

-- Variants table (A, B, C)
CREATE TABLE IF NOT EXISTS public.ab_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID REFERENCES public.ab_experiments(id) ON DELETE CASCADE,
  variant_key TEXT NOT NULL,
  config JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(experiment_id, variant_key)
);

-- Assignments table (visitor to variant mapping)
CREATE TABLE IF NOT EXISTS public.ab_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID REFERENCES public.ab_experiments(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.ab_variants(id) ON DELETE CASCADE,
  visitor_id TEXT NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(experiment_id, visitor_id)
);

-- Events table (views, conversions)
CREATE TABLE IF NOT EXISTS public.ab_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID REFERENCES public.ab_experiments(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.ab_variants(id) ON DELETE CASCADE,
  visitor_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Results table with micro-conversion tracking
CREATE TABLE IF NOT EXISTS public.ab_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID REFERENCES public.ab_experiments(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.ab_variants(id) ON DELETE CASCADE,
  visitor_id TEXT NOT NULL,
  converted BOOLEAN DEFAULT false,
  
  -- Micro-conversion tracking columns
  scroll_depth_max INTEGER DEFAULT 0,
  sections_viewed JSONB DEFAULT '[]'::jsonb,
  time_on_page_seconds INTEGER DEFAULT 0,
  faq_expansions INTEGER DEFAULT 0,
  feature_hovers INTEGER DEFAULT 0,
  engagement_score TEXT DEFAULT 'low',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(experiment_id, visitor_id)
);

-- Enable RLS on all tables
ALTER TABLE public.ab_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_test_results ENABLE ROW LEVEL SECURITY;

-- Public read policies (A/B testing needs to be accessible to all visitors)
CREATE POLICY "Allow public read on experiments" ON public.ab_experiments FOR SELECT USING (true);
CREATE POLICY "Allow public read on variants" ON public.ab_variants FOR SELECT USING (true);
CREATE POLICY "Allow public read on assignments" ON public.ab_assignments FOR SELECT USING (true);
CREATE POLICY "Allow public read on events" ON public.ab_events FOR SELECT USING (true);
CREATE POLICY "Allow public read on results" ON public.ab_test_results FOR SELECT USING (true);

-- Public insert policies (visitors need to create assignments/events)
CREATE POLICY "Allow public insert on assignments" ON public.ab_assignments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on events" ON public.ab_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on results" ON public.ab_test_results FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on results" ON public.ab_test_results FOR UPDATE USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ab_assignments_visitor ON public.ab_assignments(visitor_id);
CREATE INDEX IF NOT EXISTS idx_ab_events_visitor ON public.ab_events(visitor_id);
CREATE INDEX IF NOT EXISTS idx_ab_results_visitor ON public.ab_test_results(visitor_id);
CREATE INDEX IF NOT EXISTS idx_ab_results_engagement ON public.ab_test_results(engagement_score);
CREATE INDEX IF NOT EXISTS idx_ab_results_scroll_depth ON public.ab_test_results(scroll_depth_max);

-- Function to get experiment results
CREATE OR REPLACE FUNCTION public.get_experiment_results(exp_id UUID)
RETURNS TABLE (
  variant_key TEXT,
  views BIGINT,
  conversions BIGINT,
  conversion_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.variant_key,
    COUNT(DISTINCT e.visitor_id) as views,
    COUNT(DISTINCT CASE WHEN e.event_type = 'conversion' THEN e.visitor_id END) as conversions,
    CASE 
      WHEN COUNT(DISTINCT e.visitor_id) > 0 
      THEN ROUND((COUNT(DISTINCT CASE WHEN e.event_type = 'conversion' THEN e.visitor_id END)::numeric / COUNT(DISTINCT e.visitor_id)::numeric) * 100, 2)
      ELSE 0
    END as conversion_rate
  FROM public.ab_variants v
  LEFT JOIN public.ab_events e ON e.variant_id = v.id
  WHERE v.experiment_id = exp_id
  GROUP BY v.variant_key
  ORDER BY v.variant_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at on ab_test_results
CREATE OR REPLACE FUNCTION public.update_ab_test_results_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ab_test_results_updated_at
BEFORE UPDATE ON public.ab_test_results
FOR EACH ROW
EXECUTE FUNCTION public.update_ab_test_results_updated_at();
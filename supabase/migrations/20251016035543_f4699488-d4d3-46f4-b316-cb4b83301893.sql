-- AI Analytics Events Table
CREATE TABLE IF NOT EXISTS public.ai_analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL,
  feature text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  performance_ms integer,
  created_at timestamptz DEFAULT now()
);

-- Index for fast queries
CREATE INDEX idx_ai_analytics_user_event ON public.ai_analytics_events(user_id, event_type);
CREATE INDEX idx_ai_analytics_created_at ON public.ai_analytics_events(created_at);

-- RLS Policies
ALTER TABLE public.ai_analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own analytics"
  ON public.ai_analytics_events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own analytics"
  ON public.ai_analytics_events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all analytics"
  ON public.ai_analytics_events
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
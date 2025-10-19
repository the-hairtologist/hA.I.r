-- Comprehensive Analytics Schema
-- User Events Table (main event tracking)
CREATE TABLE IF NOT EXISTS public.user_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  event_name text NOT NULL,
  event_category text NOT NULL,
  event_data jsonb DEFAULT '{}'::jsonb,
  page_path text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  user_role text,
  device_type text,
  platform text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_events_user_id ON public.user_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_events_event_name ON public.user_events(event_name);
CREATE INDEX IF NOT EXISTS idx_user_events_event_category ON public.user_events(event_category);
CREATE INDEX IF NOT EXISTS idx_user_events_created_at ON public.user_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_events_session_id ON public.user_events(session_id);

-- User Sessions Table
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text UNIQUE NOT NULL,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  duration_seconds integer,
  page_views integer DEFAULT 0,
  events_count integer DEFAULT 0,
  entry_page text,
  exit_page text,
  device_type text,
  platform text
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_started_at ON public.user_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON public.user_sessions(session_id);

-- Conversion Funnel Events Table
CREATE TABLE IF NOT EXISTS public.conversion_funnel_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  funnel_name text NOT NULL,
  step_name text NOT NULL,
  step_order integer NOT NULL,
  completed boolean DEFAULT false,
  abandoned boolean DEFAULT false,
  time_to_complete_ms integer,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversion_funnel_user_id ON public.conversion_funnel_events(user_id);
CREATE INDEX IF NOT EXISTS idx_conversion_funnel_name ON public.conversion_funnel_events(funnel_name);
CREATE INDEX IF NOT EXISTS idx_conversion_funnel_created_at ON public.conversion_funnel_events(created_at DESC);

-- Performance Metrics Table
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  rating text,
  page_path text,
  device_type text,
  connection_type text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_metric_name ON public.performance_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_created_at ON public.performance_metrics(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.user_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversion_funnel_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_events
CREATE POLICY "Users can insert their own events"
  ON public.user_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own events"
  ON public.user_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all events"
  ON public.user_events FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for user_sessions
CREATE POLICY "Users can manage their own sessions"
  ON public.user_sessions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions"
  ON public.user_sessions FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for conversion_funnel_events
CREATE POLICY "Users can insert their own funnel events"
  ON public.conversion_funnel_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own funnel events"
  ON public.conversion_funnel_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all funnel events"
  ON public.conversion_funnel_events FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for performance_metrics
CREATE POLICY "Anyone can insert performance metrics"
  ON public.performance_metrics FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view their own metrics"
  ON public.performance_metrics FOR SELECT
  TO authenticated
  USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Admins can view all metrics"
  ON public.performance_metrics FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));
-- Mobile Optimization Tracking & Analytics
CREATE TABLE IF NOT EXISTS public.mobile_optimization_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  device_type TEXT NOT NULL,
  viewport_width INTEGER NOT NULL,
  viewport_height INTEGER NOT NULL,
  safe_area_top INTEGER DEFAULT 0,
  safe_area_bottom INTEGER DEFAULT 0,
  performance_score INTEGER,
  interaction_latency_ms INTEGER,
  offline_events_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User Mobile Preferences
CREATE TABLE IF NOT EXISTS public.user_mobile_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  haptic_feedback_enabled BOOLEAN DEFAULT true,
  reduce_animations BOOLEAN DEFAULT false,
  offline_mode_enabled BOOLEAN DEFAULT true,
  preferred_theme TEXT DEFAULT 'system',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Mobile Error Logs
CREATE TABLE IF NOT EXISTS public.mobile_error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  device_info JSONB,
  viewport_size TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mobile_optimization_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_mobile_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobile_error_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can insert their own metrics"
  ON public.mobile_optimization_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own metrics"
  ON public.mobile_optimization_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own preferences"
  ON public.user_mobile_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own errors"
  ON public.mobile_error_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all mobile errors"
  ON public.mobile_error_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Indexes for performance
CREATE INDEX idx_mobile_metrics_user_id ON public.mobile_optimization_metrics(user_id);
CREATE INDEX idx_mobile_metrics_created_at ON public.mobile_optimization_metrics(created_at DESC);
CREATE INDEX idx_mobile_errors_created_at ON public.mobile_error_logs(created_at DESC);
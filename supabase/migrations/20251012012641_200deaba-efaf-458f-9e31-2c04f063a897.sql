-- Create dashboard layout preferences table
CREATE TABLE IF NOT EXISTS public.user_dashboard_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dashboard_layout JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_dashboard_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view their own dashboard preferences
CREATE POLICY "Users can view own dashboard preferences"
  ON public.user_dashboard_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own dashboard preferences
CREATE POLICY "Users can insert own dashboard preferences"
  ON public.user_dashboard_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own dashboard preferences
CREATE POLICY "Users can update own dashboard preferences"
  ON public.user_dashboard_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_dashboard_preferences_updated_at
  BEFORE UPDATE ON public.user_dashboard_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
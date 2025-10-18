-- Create user_dashboard_preferences table for storing customized dashboard layouts
CREATE TABLE IF NOT EXISTS public.user_dashboard_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dashboard_layout JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_dashboard_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for user_dashboard_preferences
CREATE POLICY "Users can view their own dashboard preferences"
  ON public.user_dashboard_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own dashboard preferences"
  ON public.user_dashboard_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dashboard preferences"
  ON public.user_dashboard_preferences
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dashboard preferences"
  ON public.user_dashboard_preferences
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_dashboard_preferences_user_id 
  ON public.user_dashboard_preferences(user_id);

-- Add updated_at trigger
CREATE TRIGGER update_user_dashboard_preferences_updated_at
  BEFORE UPDATE ON public.user_dashboard_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
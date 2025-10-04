-- Create function to update timestamps (if not exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create table for user sidebar preferences
CREATE TABLE IF NOT EXISTS public.user_sidebar_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  sidebar_order JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_sidebar_pref UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.user_sidebar_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own sidebar preferences"
  ON public.user_sidebar_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sidebar preferences"
  ON public.user_sidebar_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sidebar preferences"
  ON public.user_sidebar_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_sidebar_preferences_updated_at
  BEFORE UPDATE ON public.user_sidebar_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
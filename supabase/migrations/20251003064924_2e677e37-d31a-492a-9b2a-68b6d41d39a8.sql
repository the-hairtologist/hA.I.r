-- Create table for dashboard layout preferences
CREATE TABLE public.dashboard_layout (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  section_order JSONB NOT NULL DEFAULT '["stats", "quick-actions", "activity", "todos", "reviews", "features"]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.dashboard_layout ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own layout" 
ON public.dashboard_layout 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own layout" 
ON public.dashboard_layout 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own layout" 
ON public.dashboard_layout 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_dashboard_layout_updated_at
BEFORE UPDATE ON public.dashboard_layout
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
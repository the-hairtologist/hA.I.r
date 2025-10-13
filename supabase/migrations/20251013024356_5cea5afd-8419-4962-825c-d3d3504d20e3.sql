-- Create product feedback table
CREATE TABLE IF NOT EXISTS public.product_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('feature_request', 'bug_report', 'improvement', 'other')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'under_review', 'planned', 'in_progress', 'completed', 'wont_fix')),
  upvotes INTEGER DEFAULT 0,
  admin_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create upvotes tracking table
CREATE TABLE IF NOT EXISTS public.feedback_upvotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feedback_id UUID NOT NULL REFERENCES public.product_feedback(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(feedback_id, user_id)
);

-- Enable RLS
ALTER TABLE public.product_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_upvotes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_feedback
CREATE POLICY "Users can view all feedback"
  ON public.product_feedback
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create their own feedback"
  ON public.product_feedback
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback"
  ON public.product_feedback
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all feedback"
  ON public.product_feedback
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete feedback"
  ON public.product_feedback
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for feedback_upvotes
CREATE POLICY "Users can view all upvotes"
  ON public.feedback_upvotes
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create their own upvotes"
  ON public.feedback_upvotes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own upvotes"
  ON public.feedback_upvotes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_product_feedback_updated_at
  BEFORE UPDATE ON public.product_feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update upvote count
CREATE OR REPLACE FUNCTION update_feedback_upvotes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE product_feedback 
    SET upvotes = upvotes + 1 
    WHERE id = NEW.feedback_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE product_feedback 
    SET upvotes = upvotes - 1 
    WHERE id = OLD.feedback_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for upvote count
CREATE TRIGGER feedback_upvotes_count_trigger
  AFTER INSERT OR DELETE ON public.feedback_upvotes
  FOR EACH ROW
  EXECUTE FUNCTION update_feedback_upvotes();
-- Create stylist_todos table for quick task management
CREATE TABLE public.stylist_todos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stylist_id UUID NOT NULL,
  task TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stylist_todos ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own todos"
  ON public.stylist_todos FOR SELECT
  USING (auth.uid() = stylist_id);

CREATE POLICY "Users can create their own todos"
  ON public.stylist_todos FOR INSERT
  WITH CHECK (auth.uid() = stylist_id);

CREATE POLICY "Users can update their own todos"
  ON public.stylist_todos FOR UPDATE
  USING (auth.uid() = stylist_id);

CREATE POLICY "Users can delete their own todos"
  ON public.stylist_todos FOR DELETE
  USING (auth.uid() = stylist_id);

-- Trigger for updated_at
CREATE TRIGGER update_stylist_todos_updated_at
  BEFORE UPDATE ON public.stylist_todos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
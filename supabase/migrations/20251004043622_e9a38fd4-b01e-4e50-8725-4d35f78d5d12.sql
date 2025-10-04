-- Create table for saved AI-generated formulas
CREATE TABLE public.ai_formulas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  formula_name TEXT NOT NULL,
  prompt TEXT NOT NULL,
  formula_content TEXT NOT NULL,
  tags TEXT[],
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_formulas ENABLE ROW LEVEL SECURITY;

-- Create policies for ai_formulas
CREATE POLICY "Users can view their own formulas" 
ON public.ai_formulas 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own formulas" 
ON public.ai_formulas 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own formulas" 
ON public.ai_formulas 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own formulas" 
ON public.ai_formulas 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create table for AI color correction sessions
CREATE TABLE public.ai_corrections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  problem_description TEXT NOT NULL,
  correction_steps JSONB NOT NULL,
  status TEXT DEFAULT 'in_progress',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_corrections ENABLE ROW LEVEL SECURITY;

-- Create policies for ai_corrections
CREATE POLICY "Users can view their own corrections" 
ON public.ai_corrections 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own corrections" 
ON public.ai_corrections 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own corrections" 
ON public.ai_corrections 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own corrections" 
ON public.ai_corrections 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_ai_corrections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ai_corrections_timestamp
BEFORE UPDATE ON public.ai_corrections
FOR EACH ROW
EXECUTE FUNCTION public.update_ai_corrections_updated_at();
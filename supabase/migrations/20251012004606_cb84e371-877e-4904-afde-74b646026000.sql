-- Create onboarding progress tracking table
CREATE TABLE IF NOT EXISTS public.onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_step INTEGER DEFAULT 0,
  completed_steps JSONB DEFAULT '[]'::jsonb,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own onboarding progress"
  ON public.onboarding_progress
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding progress"
  ON public.onboarding_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding progress"
  ON public.onboarding_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_onboarding_progress_updated_at
  BEFORE UPDATE ON public.onboarding_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Make stylist profiles discoverable
ALTER TABLE public.stylist_profiles 
ADD COLUMN IF NOT EXISTS is_public_listing BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS booking_link TEXT,
ADD COLUMN IF NOT EXISTS instant_booking_enabled BOOLEAN DEFAULT false;

-- Drop and recreate public view for stylist discovery (no sensitive data)
DROP VIEW IF EXISTS public.public_stylist_profiles_safe;

CREATE VIEW public.public_stylist_profiles_safe AS
SELECT 
  sp.id,
  sp.user_id,
  sp.business_name,
  sp.bio,
  sp.specialty,
  sp.location,
  sp.years_experience,
  sp.average_rating,
  sp.total_reviews,
  sp.is_public_listing,
  sp.is_available,
  sp.created_at
FROM stylist_profiles sp
WHERE sp.is_public_listing = true
  AND sp.is_available = true;

-- Allow public access to stylist directory
GRANT SELECT ON public.public_stylist_profiles_safe TO anon, authenticated;
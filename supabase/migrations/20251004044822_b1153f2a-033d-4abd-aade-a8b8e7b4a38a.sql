-- Create client hair posts table for clients to advertise their hair needs
CREATE TABLE public.client_hair_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  service_type TEXT NOT NULL,
  budget_range TEXT,
  location TEXT,
  photo_urls TEXT[],
  preferred_date DATE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'claimed', 'completed', 'cancelled')),
  claimed_by_stylist_id UUID REFERENCES stylist_profiles(id) ON DELETE SET NULL,
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_hair_posts ENABLE ROW LEVEL SECURITY;

-- Clients can create their own posts
CREATE POLICY "Clients can create own posts"
ON public.client_hair_posts
FOR INSERT
TO authenticated
WITH CHECK (client_id = get_client_profile_id(auth.uid()));

-- Clients can view their own posts
CREATE POLICY "Clients can view own posts"
ON public.client_hair_posts
FOR SELECT
TO authenticated
USING (client_id = get_client_profile_id(auth.uid()));

-- Clients can update their own posts
CREATE POLICY "Clients can update own posts"
ON public.client_hair_posts
FOR UPDATE
TO authenticated
USING (client_id = get_client_profile_id(auth.uid()));

-- Clients can delete their own posts
CREATE POLICY "Clients can delete own posts"
ON public.client_hair_posts
FOR DELETE
TO authenticated
USING (client_id = get_client_profile_id(auth.uid()));

-- Stylists can view all open posts
CREATE POLICY "Stylists can view open posts"
ON public.client_hair_posts
FOR SELECT
TO authenticated
USING (
  status = 'open' 
  AND EXISTS (
    SELECT 1 FROM stylist_profiles 
    WHERE stylist_profiles.user_id = auth.uid()
  )
);

-- Stylists can view posts they've claimed
CREATE POLICY "Stylists can view claimed posts"
ON public.client_hair_posts
FOR SELECT
TO authenticated
USING (
  claimed_by_stylist_id IN (
    SELECT id FROM stylist_profiles WHERE user_id = auth.uid()
  )
);

-- Stylists can update posts they've claimed (to mark as completed)
CREATE POLICY "Stylists can update claimed posts"
ON public.client_hair_posts
FOR UPDATE
TO authenticated
USING (
  claimed_by_stylist_id IN (
    SELECT id FROM stylist_profiles WHERE user_id = auth.uid()
  )
);

-- Create index for performance
CREATE INDEX idx_client_posts_status ON client_hair_posts(status);
CREATE INDEX idx_client_posts_client_id ON client_hair_posts(client_id);
CREATE INDEX idx_client_posts_created_at ON client_hair_posts(created_at DESC);

-- Trigger to update updated_at
CREATE TRIGGER update_client_hair_posts_updated_at
BEFORE UPDATE ON public.client_hair_posts
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
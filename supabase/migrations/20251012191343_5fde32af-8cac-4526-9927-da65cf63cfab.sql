-- Create favorite_stylists table for clients to save their preferred stylists
CREATE TABLE IF NOT EXISTS public.favorite_stylists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stylist_profile_id UUID NOT NULL REFERENCES public.stylist_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id, stylist_profile_id)
);

-- Enable RLS
ALTER TABLE public.favorite_stylists ENABLE ROW LEVEL SECURITY;

-- Policies for favorite_stylists
CREATE POLICY "Clients can view their own favorites"
  ON public.favorite_stylists
  FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Clients can add favorites"
  ON public.favorite_stylists
  FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can remove favorites"
  ON public.favorite_stylists
  FOR DELETE
  USING (auth.uid() = client_id);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_favorite_stylists_client_id ON public.favorite_stylists(client_id);
CREATE INDEX IF NOT EXISTS idx_favorite_stylists_stylist_profile_id ON public.favorite_stylists(stylist_profile_id);
-- Fix: Remove overly permissive policy that exposes stylist contact information
DROP POLICY IF EXISTS "Users can view stylist profiles" ON public.profiles;

-- Add secure policy: Allow stylists and clients to view each other's profiles only if they have appointments together
CREATE POLICY "Clients can view their stylists profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT sp.user_id
    FROM stylist_profiles sp
    INNER JOIN appointments a ON a.stylist_id = sp.id
    INNER JOIN client_profiles cp ON cp.id = a.client_id
    WHERE cp.user_id = auth.uid()
  )
);

CREATE POLICY "Stylists can view their clients profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT cp.user_id
    FROM client_profiles cp
    INNER JOIN appointments a ON a.client_id = cp.id
    INNER JOIN stylist_profiles sp ON sp.id = a.stylist_id
    WHERE sp.user_id = auth.uid()
  )
);
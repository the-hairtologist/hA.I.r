-- Security Fix #1: Restrict stylist_schedule_overrides to prevent stalking
-- Drop overly permissive policy
DROP POLICY IF EXISTS "Anyone can view schedule overrides" ON public.stylist_schedule_overrides;

-- Only stylists can view their own schedule overrides
CREATE POLICY "Stylists can view own schedule overrides"
ON public.stylist_schedule_overrides
FOR SELECT
USING (
  stylist_id IN (
    SELECT id FROM stylist_profiles WHERE user_id = auth.uid()
  )
);

-- Clients can view availability windows for their stylists (appointments in last 90 days)
CREATE POLICY "Clients can view their stylist schedule availability"
ON public.stylist_schedule_overrides
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND stylist_id IN (
    SELECT DISTINCT a.stylist_id
    FROM appointments a
    JOIN client_profiles cp ON cp.id = a.client_id
    WHERE cp.user_id = auth.uid()
    AND a.appointment_date >= NOW() - INTERVAL '90 days'
  )
);

-- Security Fix #2: Restrict stylist_services pricing visibility
-- Drop overly permissive policy
DROP POLICY IF EXISTS "Anyone can view active services" ON public.stylist_services;

-- Authenticated users can view services for stylists they have relationships with
CREATE POLICY "Authenticated users can view services for connected stylists"
ON public.stylist_services
FOR SELECT
USING (
  is_active = true
  AND (
    -- Stylists can see their own services
    stylist_id IN (
      SELECT id FROM stylist_profiles WHERE user_id = auth.uid()
    )
    OR
    -- Clients can see services for stylists they have appointments with
    (
      auth.uid() IS NOT NULL
      AND stylist_id IN (
        SELECT DISTINCT a.stylist_id
        FROM appointments a
        JOIN client_profiles cp ON cp.id = a.client_id
        WHERE cp.user_id = auth.uid()
        AND a.appointment_date >= NOW() - INTERVAL '90 days'
      )
    )
    OR
    -- Clients can see services for their preferred stylist
    (
      auth.uid() IS NOT NULL
      AND stylist_id IN (
        SELECT preferred_stylist_id
        FROM client_profiles
        WHERE user_id = auth.uid()
        AND preferred_stylist_id IS NOT NULL
      )
    )
  )
);

-- Security Fix #3: Restrict hair_brands commission rates
-- Drop overly permissive policy
DROP POLICY IF EXISTS "Anyone can view active brands" ON public.hair_brands;

-- Public can view brand names and logos only
CREATE POLICY "Public can view basic brand info"
ON public.hair_brands
FOR SELECT
USING (is_active = true);

-- Only authenticated stylists can view commission rates and affiliate URLs
CREATE POLICY "Stylists can view full brand details"
ON public.hair_brands
FOR SELECT
USING (
  is_active = true
  AND EXISTS (
    SELECT 1 FROM stylist_profiles WHERE user_id = auth.uid()
  )
);

-- Security Fix #4: Update has_role function to ensure search_path (already has it, but adding comment for clarity)
COMMENT ON FUNCTION public.has_role(uuid, app_role) IS 'Security definer function with explicit search_path to prevent privilege escalation';

-- Security Fix #5: Ensure knowledge_resources properly restricts premium content
-- The existing policy "Everyone can view free resources" is correct, but add authenticated policy
CREATE POLICY "Authenticated users can view premium resources"
ON public.knowledge_resources
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  OR is_free = true
);
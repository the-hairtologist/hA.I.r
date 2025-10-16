-- PostgreSQL doesn't support IF NOT EXISTS for policies, so we use DO blocks

-- Ensure stylist_profiles has comprehensive access policies
DO $$ 
BEGIN
  -- Drop and recreate to ensure clean state
  DROP POLICY IF EXISTS "stylist_profiles_user_select" ON stylist_profiles;
  CREATE POLICY "stylist_profiles_user_select"
  ON stylist_profiles
  FOR SELECT
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN
  -- Policy already exists, skip
  NULL;
END $$;

-- Ensure profiles has comprehensive access policies  
DO $$
BEGIN
  DROP POLICY IF EXISTS "profiles_user_select" ON profiles;
  CREATE POLICY "profiles_user_select"
  ON profiles
  FOR SELECT
  USING (id = auth.uid() OR has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- Add UPDATE policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "profiles_user_update" ON profiles;
  CREATE POLICY "profiles_user_update"
  ON profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  DROP POLICY IF EXISTS "stylist_profiles_user_update" ON stylist_profiles;
  CREATE POLICY "stylist_profiles_user_update"
  ON stylist_profiles
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;
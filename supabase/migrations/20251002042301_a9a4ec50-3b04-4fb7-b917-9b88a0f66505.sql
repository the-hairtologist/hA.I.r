-- Fix profiles table security - restrict viewing to own profile or profiles of stylists only
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;

CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can view stylist profiles"
ON profiles FOR SELECT
USING (
  id IN (
    SELECT user_id FROM stylist_profiles
  )
);
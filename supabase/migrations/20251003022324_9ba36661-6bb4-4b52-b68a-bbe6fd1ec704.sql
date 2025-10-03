-- Make user_id nullable so stylists can create client profiles for clients without accounts
ALTER TABLE client_profiles ALTER COLUMN user_id DROP NOT NULL;

-- Add email field to client_profiles for contact purposes
ALTER TABLE client_profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE client_profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE client_profiles ADD COLUMN IF NOT EXISTS full_name text;

-- Update RLS policies to allow stylists to create client profiles
DROP POLICY IF EXISTS "Stylists can view their clients" ON client_profiles;
DROP POLICY IF EXISTS "Clients can insert own profile" ON client_profiles;

CREATE POLICY "Stylists can view their clients"
ON client_profiles FOR SELECT
USING (
  preferred_stylist_id IN (
    SELECT id FROM stylist_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Stylists can create client profiles"
ON client_profiles FOR INSERT
WITH CHECK (
  preferred_stylist_id IN (
    SELECT id FROM stylist_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Stylists can update their client profiles"
ON client_profiles FOR UPDATE
USING (
  preferred_stylist_id IN (
    SELECT id FROM stylist_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Clients can insert own profile"
ON client_profiles FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Allow clients to still see their own profile if they have an account
CREATE POLICY "Clients can view own profile by user_id"
ON client_profiles FOR SELECT
USING (user_id = auth.uid());

-- Add stylist role to admin user (now allowed by updated trigger)
INSERT INTO user_roles (user_id, role)
VALUES ('ce5f219f-5c83-4b0c-8a7b-0ec5adb7cb54', 'stylist')
ON CONFLICT (user_id, role) DO NOTHING;

-- Create stylist profile for admin
INSERT INTO stylist_profiles (
  user_id,
  business_name,
  business_email,
  bio,
  accepts_new_clients,
  is_available
)
VALUES (
  'ce5f219f-5c83-4b0c-8a7b-0ec5adb7cb54',
  'Tommy Liu - Admin Access',
  'theha.i.rtologist@gmail.com',
  'Full admin access to all features',
  true,
  true
)
ON CONFLICT (user_id) DO UPDATE SET
  business_name = EXCLUDED.business_name,
  business_email = EXCLUDED.business_email;

-- Update client profile with proper info
UPDATE client_profiles
SET 
  full_name = 'Tommy liu',
  email = 'theha.i.rtologist@gmail.com'
WHERE user_id = 'ce5f219f-5c83-4b0c-8a7b-0ec5adb7cb54';

-- Ensure admin can access all client profiles (SELECT)
DROP POLICY IF EXISTS "Admin can view all client profiles" ON client_profiles;
CREATE POLICY "Admin can view all client profiles"
ON client_profiles FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Ensure admin can update all client profiles
DROP POLICY IF EXISTS "Admin can update all client profiles" ON client_profiles;
CREATE POLICY "Admin can update all client profiles"
ON client_profiles FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Ensure admin can insert client profiles
DROP POLICY IF EXISTS "Admin can insert client profiles" ON client_profiles;
CREATE POLICY "Admin can insert client profiles"
ON client_profiles FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Ensure admin can access all stylist profiles (SELECT)
DROP POLICY IF EXISTS "Admin can view all stylist profiles" ON stylist_profiles;
CREATE POLICY "Admin can view all stylist profiles"
ON stylist_profiles FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Ensure admin can update all stylist profiles
DROP POLICY IF EXISTS "Admin can update all stylist profiles" ON stylist_profiles;
CREATE POLICY "Admin can update all stylist profiles"
ON stylist_profiles FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Ensure admin can insert stylist profiles
DROP POLICY IF EXISTS "Admin can insert stylist profiles" ON stylist_profiles;
CREATE POLICY "Admin can insert stylist profiles"
ON stylist_profiles FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Ensure admin can view all appointments
DROP POLICY IF EXISTS "Admin can view all appointments" ON appointments;
CREATE POLICY "Admin can view all appointments"
ON appointments FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Ensure admin can update all appointments
DROP POLICY IF EXISTS "Admin can update all appointments" ON appointments;
CREATE POLICY "Admin can update all appointments"
ON appointments FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Ensure admin can insert appointments
DROP POLICY IF EXISTS "Admin can insert appointments" ON appointments;
CREATE POLICY "Admin can insert appointments"
ON appointments FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Ensure admin can delete appointments
DROP POLICY IF EXISTS "Admin can delete appointments" ON appointments;
CREATE POLICY "Admin can delete appointments"
ON appointments FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'));

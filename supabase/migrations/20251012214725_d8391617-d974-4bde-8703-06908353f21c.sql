-- Add admin SELECT access to existing tables that need it

-- Reviews
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'reviews' AND policyname = 'reviews_select_admin'
  ) THEN
    CREATE POLICY "reviews_select_admin"
    ON reviews
    FOR SELECT
    TO authenticated
    USING (has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- Portfolio photos
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'portfolio_photos' AND policyname = 'portfolio_select_admin'
  ) THEN
    CREATE POLICY "portfolio_select_admin"
    ON portfolio_photos
    FOR SELECT
    TO authenticated
    USING (has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- Stylist notes
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'stylist_notes' AND policyname = 'stylist_notes_select_admin'
  ) THEN
    CREATE POLICY "stylist_notes_select_admin"
    ON stylist_notes
    FOR SELECT
    TO authenticated
    USING (has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- User roles
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_roles' AND policyname = 'user_roles_select_admin'
  ) THEN
    CREATE POLICY "user_roles_select_admin"
    ON user_roles
    FOR SELECT
    TO authenticated
    USING (has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- Profiles
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'profiles_select_admin'
  ) THEN
    CREATE POLICY "profiles_select_admin"
    ON profiles
    FOR SELECT
    TO authenticated
    USING (has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- Favorite stylists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'favorite_stylists' AND policyname = 'favorite_stylists_select_admin'
  ) THEN
    CREATE POLICY "favorite_stylists_select_admin"
    ON favorite_stylists
    FOR SELECT
    TO authenticated
    USING (has_role(auth.uid(), 'admin'));
  END IF;
END $$;
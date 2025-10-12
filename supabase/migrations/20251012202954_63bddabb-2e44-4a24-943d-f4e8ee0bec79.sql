-- Add booking_instructions column to stylist_profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'stylist_profiles' 
    AND column_name = 'booking_instructions'
  ) THEN
    ALTER TABLE public.stylist_profiles 
    ADD COLUMN booking_instructions TEXT;
  END IF;
END $$;
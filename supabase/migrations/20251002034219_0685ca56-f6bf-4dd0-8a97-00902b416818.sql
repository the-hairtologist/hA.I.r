-- Fix video storage policies so stylists can view client videos
DROP POLICY IF EXISTS "Stylists can view client videos" ON storage.objects;

-- Stylists can view videos from their clients
CREATE POLICY "Stylists can view client videos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'client-videos' 
    AND EXISTS (
      SELECT 1 FROM client_profiles cp
      JOIN stylist_profiles sp ON cp.preferred_stylist_id = sp.id
      WHERE sp.user_id = auth.uid()
        AND cp.user_id::text = (storage.foldername(name))[1]
    )
  );

-- Add unique constraint to prevent duplicate referral codes
ALTER TABLE stylist_affiliate_codes
  ADD CONSTRAINT unique_referral_code UNIQUE (referral_code);

-- Add index for appointment conflict checking
CREATE INDEX IF NOT EXISTS idx_appointments_conflict_check 
  ON appointments(stylist_id, appointment_date, status)
  WHERE status != 'cancelled';
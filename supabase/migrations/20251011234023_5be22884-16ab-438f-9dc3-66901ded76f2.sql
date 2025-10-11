-- Add verification fields to stylist_profiles
ALTER TABLE stylist_profiles
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
ADD COLUMN IF NOT EXISTS license_number TEXT,
ADD COLUMN IF NOT EXISTS license_state TEXT,
ADD COLUMN IF NOT EXISTS license_photo_url TEXT,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS verification_notes TEXT,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Create index for faster verification queries
CREATE INDEX IF NOT EXISTS idx_stylist_verification_status ON stylist_profiles(verification_status);

-- Update RLS policies to restrict unverified stylists
-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Stylists can view own profile" ON stylist_profiles;
DROP POLICY IF EXISTS "Stylists can update own profile" ON stylist_profiles;

-- Recreate with verification checks
CREATE POLICY "Stylists can view own profile"
ON stylist_profiles
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Stylists can update own profile"
ON stylist_profiles
FOR UPDATE
USING (
  user_id = auth.uid() AND
  (verification_status = 'verified' OR verification_status = 'pending')
);

-- Admins can manage verification
CREATE POLICY "Admins can manage verification"
ON stylist_profiles
FOR UPDATE
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Admins can view all stylist profiles for verification
CREATE POLICY "Admins can view all profiles"
ON stylist_profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Create verification admin function
CREATE OR REPLACE FUNCTION verify_stylist(
  _stylist_id UUID,
  _status TEXT,
  _notes TEXT DEFAULT NULL,
  _rejection_reason TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify caller is admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only administrators can verify stylists';
  END IF;

  -- Validate status
  IF _status NOT IN ('verified', 'rejected') THEN
    RAISE EXCEPTION 'Invalid verification status. Must be verified or rejected.';
  END IF;

  -- Update stylist profile
  UPDATE stylist_profiles
  SET 
    verification_status = _status,
    verified_at = CASE WHEN _status = 'verified' THEN NOW() ELSE NULL END,
    verified_by = CASE WHEN _status = 'verified' THEN auth.uid() ELSE NULL END,
    verification_notes = _notes,
    rejection_reason = CASE WHEN _status = 'rejected' THEN _rejection_reason ELSE NULL END
  WHERE id = _stylist_id;

  -- Log the verification action
  INSERT INTO audit_logs (
    user_id,
    table_name,
    action,
    record_id,
    new_data
  ) VALUES (
    auth.uid(),
    'stylist_profiles',
    'VERIFY_STYLIST',
    _stylist_id,
    jsonb_build_object(
      'status', _status,
      'notes', _notes,
      'rejection_reason', _rejection_reason,
      'timestamp', NOW()
    )
  );
END;
$$;
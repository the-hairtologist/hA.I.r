-- Add gender field to profiles table
ALTER TABLE profiles ADD COLUMN gender text CHECK (gender IN ('male', 'female', 'neutral'));

-- Add comment to explain the column
COMMENT ON COLUMN profiles.gender IS 'User gender selection for personalized avatar display';
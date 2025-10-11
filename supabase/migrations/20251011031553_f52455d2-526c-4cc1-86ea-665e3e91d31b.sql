-- Add email_digest_enabled column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_digest_enabled BOOLEAN DEFAULT false;
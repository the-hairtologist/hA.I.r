-- Add columns to track Apple IAP subscriptions and improve subscription management
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS subscription_product_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS apple_receipt TEXT;

-- Create index for faster subscription lookups
CREATE INDEX IF NOT EXISTS idx_profiles_subscription 
ON profiles(subscription_status, subscription_end);

-- Add comments for documentation
COMMENT ON COLUMN profiles.subscription_status IS 'Subscription status: active, expired, cancelled, grace_period, trial';
COMMENT ON COLUMN profiles.subscription_product_id IS 'Stripe or Apple product ID for the active subscription';
COMMENT ON COLUMN profiles.subscription_end IS 'Timestamp when the subscription expires or renews';
COMMENT ON COLUMN profiles.apple_receipt IS 'Latest Apple receipt data for IAP validation (base64 encoded)';

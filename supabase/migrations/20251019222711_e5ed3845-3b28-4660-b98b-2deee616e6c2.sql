-- Add webhook delivery tracking columns
ALTER TABLE zapier_webhooks
ADD COLUMN IF NOT EXISTS last_triggered_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_success_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_failure_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS total_triggers INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_failures INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_error_message TEXT;

-- Create webhook delivery log table for detailed tracking
CREATE TABLE IF NOT EXISTS zapier_delivery_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES zapier_webhooks(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL, -- 'success', 'failed', 'retrying'
  http_status INTEGER,
  error_message TEXT,
  attempt_number INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE zapier_delivery_log ENABLE ROW LEVEL SECURITY;

-- Stylists can view their own delivery logs
CREATE POLICY "Stylists can view their delivery logs"
ON zapier_delivery_log
FOR SELECT
USING (
  webhook_id IN (
    SELECT id FROM zapier_webhooks
    WHERE stylist_id IN (
      SELECT id FROM stylist_profiles WHERE user_id = auth.uid()
    )
  )
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_zapier_delivery_log_webhook_id ON zapier_delivery_log(webhook_id);
CREATE INDEX IF NOT EXISTS idx_zapier_delivery_log_created_at ON zapier_delivery_log(created_at DESC);
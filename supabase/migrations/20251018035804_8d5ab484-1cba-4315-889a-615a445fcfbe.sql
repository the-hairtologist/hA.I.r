-- Create SMS conversation tracking table for two-way SMS
CREATE TABLE IF NOT EXISTS public.sms_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  stylist_id UUID REFERENCES public.stylist_profiles(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  message_body TEXT NOT NULL,
  twilio_sid TEXT,
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create client sentiment analysis table
CREATE TABLE IF NOT EXISTS public.client_sentiment_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  stylist_id UUID REFERENCES public.stylist_profiles(id) ON DELETE CASCADE,
  sentiment TEXT NOT NULL CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  confidence NUMERIC CHECK (confidence >= 0 AND confidence <= 1),
  insights JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table for SMS and other alerts (if not exists)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.sms_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_sentiment_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for SMS conversations
CREATE POLICY "Stylists can view their SMS conversations"
  ON public.sms_conversations FOR SELECT
  USING (stylist_id IN (SELECT id FROM public.stylist_profiles WHERE user_id = auth.uid()));

CREATE POLICY "System can insert SMS conversations"
  ON public.sms_conversations FOR INSERT WITH CHECK (true);

-- RLS policies for sentiment analysis
CREATE POLICY "Stylists can view their client sentiment"
  ON public.client_sentiment_analysis FOR SELECT
  USING (stylist_id IN (SELECT id FROM public.stylist_profiles WHERE user_id = auth.uid()));

CREATE POLICY "System can insert sentiment analysis"
  ON public.client_sentiment_analysis FOR INSERT WITH CHECK (true);

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sms_conversations_client_id ON public.sms_conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_sms_conversations_stylist_id ON public.sms_conversations(stylist_id);
CREATE INDEX IF NOT EXISTS idx_sms_conversations_created_at ON public.sms_conversations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sentiment_analysis_client_id ON public.client_sentiment_analysis(client_id);
CREATE INDEX IF NOT EXISTS idx_sentiment_analysis_stylist_id ON public.client_sentiment_analysis(stylist_id);
CREATE INDEX IF NOT EXISTS idx_sentiment_analysis_analyzed_at ON public.client_sentiment_analysis(analyzed_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
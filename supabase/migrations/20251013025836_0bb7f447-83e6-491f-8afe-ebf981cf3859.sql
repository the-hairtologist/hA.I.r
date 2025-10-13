-- =====================================================
-- EMAIL SEQUENCE SYSTEM - Comprehensive Implementation
-- =====================================================

-- 1. Email Sequences (Master Templates)
CREATE TABLE public.email_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL, -- 'manual', 'new_client', 'post_appointment', 'inactive_client', 'birthday', 'anniversary', 'pre_appointment'
  trigger_conditions JSONB, -- Additional conditions like: {"days_after": 7, "appointment_status": "completed"}
  is_active BOOLEAN DEFAULT true,
  is_global_template BOOLEAN DEFAULT false, -- Admin-created templates that stylists can copy
  created_by UUID REFERENCES auth.users(id),
  stylist_id UUID REFERENCES stylist_profiles(id), -- NULL for global templates
  category TEXT, -- 'onboarding', 'retention', 'promotional', 'educational'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Email Sequence Steps (Individual Emails)
CREATE TABLE public.email_sequence_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id UUID NOT NULL REFERENCES email_sequences(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  name TEXT NOT NULL, -- Internal name for the step
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  delay_amount INTEGER NOT NULL DEFAULT 0, -- How long to wait before sending
  delay_unit TEXT NOT NULL DEFAULT 'days', -- 'minutes', 'hours', 'days', 'weeks'
  send_time_preference TEXT DEFAULT 'any_time', -- 'morning', 'afternoon', 'evening', 'any_time'
  stop_on_conditions JSONB, -- Auto-stop if conditions met: {"client_booked": true}
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(sequence_id, step_order)
);

-- 3. Email Sequence Enrollments (Who's in what sequence)
CREATE TABLE public.email_sequence_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  sequence_id UUID NOT NULL REFERENCES email_sequences(id) ON DELETE CASCADE,
  stylist_id UUID NOT NULL REFERENCES stylist_profiles(id),
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  current_step INTEGER DEFAULT 1,
  next_send_at TIMESTAMPTZ, -- When next email should be sent
  status TEXT DEFAULT 'active', -- 'active', 'paused', 'completed', 'unsubscribed', 'stopped'
  completed_at TIMESTAMPTZ,
  unenrolled_at TIMESTAMPTZ,
  unenrolled_reason TEXT,
  metadata JSONB, -- Store enrollment-specific data
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(client_id, sequence_id) -- One enrollment per client per sequence
);

-- 4. Email Sequence Logs (Track every send)
CREATE TABLE public.email_sequence_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES email_sequence_enrollments(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES email_sequence_steps(id),
  sent_at TIMESTAMPTZ DEFAULT now(),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  bounced BOOLEAN DEFAULT false,
  bounce_reason TEXT,
  unsubscribed BOOLEAN DEFAULT false,
  client_id UUID NOT NULL REFERENCES client_profiles(id),
  stylist_id UUID NOT NULL REFERENCES stylist_profiles(id),
  email_address TEXT NOT NULL,
  subject TEXT NOT NULL,
  resend_email_id TEXT, -- External email ID from Resend
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Email Templates (Reusable beautiful templates)
CREATE TABLE public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'welcome', 'appointment', 'follow_up', 'promotional', 'educational'
  description TEXT,
  subject_template TEXT NOT NULL,
  html_content TEXT NOT NULL,
  variables JSONB, -- List of available variables: ["client_name", "stylist_name", "appointment_date"]
  preview_text TEXT,
  is_global BOOLEAN DEFAULT false, -- Available to all stylists
  created_by UUID REFERENCES auth.users(id),
  stylist_id UUID REFERENCES stylist_profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_sequence_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_sequence_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_sequence_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- EMAIL SEQUENCES POLICIES
CREATE POLICY "Admins can manage all sequences"
  ON email_sequences FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Stylists can view global templates"
  ON email_sequences FOR SELECT
  USING (
    is_global_template = true OR
    stylist_id IN (SELECT id FROM stylist_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Stylists can create their own sequences"
  ON email_sequences FOR INSERT
  WITH CHECK (
    stylist_id IN (SELECT id FROM stylist_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Stylists can update their own sequences"
  ON email_sequences FOR UPDATE
  USING (
    stylist_id IN (SELECT id FROM stylist_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Stylists can delete their own sequences"
  ON email_sequences FOR DELETE
  USING (
    stylist_id IN (SELECT id FROM stylist_profiles WHERE user_id = auth.uid())
  );

-- EMAIL SEQUENCE STEPS POLICIES
CREATE POLICY "Admins can manage all steps"
  ON email_sequence_steps FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Stylists can manage steps for their sequences"
  ON email_sequence_steps FOR ALL
  USING (
    sequence_id IN (
      SELECT id FROM email_sequences 
      WHERE stylist_id IN (SELECT id FROM stylist_profiles WHERE user_id = auth.uid())
      OR is_global_template = true
    )
  );

-- EMAIL SEQUENCE ENROLLMENTS POLICIES
CREATE POLICY "Admins can view all enrollments"
  ON email_sequence_enrollments FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Stylists can view their client enrollments"
  ON email_sequence_enrollments FOR SELECT
  USING (
    stylist_id IN (SELECT id FROM stylist_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Stylists can enroll their clients"
  ON email_sequence_enrollments FOR INSERT
  WITH CHECK (
    stylist_id IN (SELECT id FROM stylist_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Stylists can update their client enrollments"
  ON email_sequence_enrollments FOR UPDATE
  USING (
    stylist_id IN (SELECT id FROM stylist_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Clients can view their own enrollments"
  ON email_sequence_enrollments FOR SELECT
  USING (
    client_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Clients can update their own enrollments"
  ON email_sequence_enrollments FOR UPDATE
  USING (
    client_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid())
  );

-- EMAIL SEQUENCE LOGS POLICIES
CREATE POLICY "Admins can view all logs"
  ON email_sequence_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Stylists can view logs for their clients"
  ON email_sequence_logs FOR SELECT
  USING (
    stylist_id IN (SELECT id FROM stylist_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "System can insert logs"
  ON email_sequence_logs FOR INSERT
  WITH CHECK (true);

-- EMAIL TEMPLATES POLICIES
CREATE POLICY "Everyone can view global templates"
  ON email_templates FOR SELECT
  USING (is_global = true);

CREATE POLICY "Stylists can view their own templates"
  ON email_templates FOR SELECT
  USING (
    stylist_id IN (SELECT id FROM stylist_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Stylists can create their own templates"
  ON email_templates FOR INSERT
  WITH CHECK (
    stylist_id IN (SELECT id FROM stylist_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Stylists can update their own templates"
  ON email_templates FOR UPDATE
  USING (
    stylist_id IN (SELECT id FROM stylist_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all templates"
  ON email_templates FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_sequences_stylist ON email_sequences(stylist_id);
CREATE INDEX idx_sequences_active ON email_sequences(is_active);
CREATE INDEX idx_sequences_trigger ON email_sequences(trigger_type);

CREATE INDEX idx_steps_sequence ON email_sequence_steps(sequence_id);
CREATE INDEX idx_steps_order ON email_sequence_steps(sequence_id, step_order);

CREATE INDEX idx_enrollments_client ON email_sequence_enrollments(client_id);
CREATE INDEX idx_enrollments_stylist ON email_sequence_enrollments(stylist_id);
CREATE INDEX idx_enrollments_status ON email_sequence_enrollments(status);
CREATE INDEX idx_enrollments_next_send ON email_sequence_enrollments(next_send_at) WHERE status = 'active';

CREATE INDEX idx_logs_enrollment ON email_sequence_logs(enrollment_id);
CREATE INDEX idx_logs_sent_at ON email_sequence_logs(sent_at);
CREATE INDEX idx_logs_stylist ON email_sequence_logs(stylist_id);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE TRIGGER update_sequences_updated_at
  BEFORE UPDATE ON email_sequences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_steps_updated_at
  BEFORE UPDATE ON email_sequence_steps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enrollments_updated_at
  BEFORE UPDATE ON email_sequence_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
-- Add database indices for performance
CREATE INDEX IF NOT EXISTS idx_appointments_stylist_id ON public.appointments(stylist_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON public.appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);

CREATE INDEX IF NOT EXISTS idx_formulas_stylist_id ON public.formulas(stylist_id);
CREATE INDEX IF NOT EXISTS idx_formulas_client_id ON public.formulas(client_id);

CREATE INDEX IF NOT EXISTS idx_commissions_stylist_id ON public.commissions(stylist_id);
CREATE INDEX IF NOT EXISTS idx_commissions_brand_id ON public.commissions(brand_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON public.commissions(status);

CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_stylist_affiliate_codes_stylist_id ON public.stylist_affiliate_codes(stylist_id);
CREATE INDEX IF NOT EXISTS idx_stylist_affiliate_codes_brand_id ON public.stylist_affiliate_codes(brand_id);

CREATE INDEX IF NOT EXISTS idx_payments_stylist_id ON public.payments(stylist_id);
CREATE INDEX IF NOT EXISTS idx_payments_client_id ON public.payments(client_id);

-- Fix storage policies for better security
DROP POLICY IF EXISTS "Clients can upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Clients can upload own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own videos" ON storage.objects;

-- Create secure upload policy
CREATE POLICY "Users can upload own videos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'client-videos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create secure view policy  
CREATE POLICY "Users can view own videos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'client-videos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
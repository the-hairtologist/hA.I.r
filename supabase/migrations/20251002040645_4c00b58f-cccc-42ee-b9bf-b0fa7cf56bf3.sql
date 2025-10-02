-- Add service pricing and management
CREATE TABLE IF NOT EXISTS public.stylist_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stylist_id UUID NOT NULL REFERENCES public.stylist_profiles(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 90,
  price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.stylist_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stylists can manage own services"
ON public.stylist_services FOR ALL
USING (stylist_id IN (SELECT id FROM stylist_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Anyone can view active services"
ON public.stylist_services FOR SELECT
USING (is_active = true);

-- Add reviews and ratings
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stylist_id UUID NOT NULL REFERENCES public.stylist_profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id, appointment_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can create own reviews"
ON public.reviews FOR INSERT
WITH CHECK (client_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Clients can update own reviews"
ON public.reviews FOR UPDATE
USING (client_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Anyone can view reviews"
ON public.reviews FOR SELECT
USING (true);

CREATE POLICY "Clients can delete own reviews"
ON public.reviews FOR DELETE
USING (client_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid()));

-- Add average rating to stylist profiles (computed)
ALTER TABLE public.stylist_profiles ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0;
ALTER TABLE public.stylist_profiles ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;

-- Add blocked dates for stylists
CREATE TABLE IF NOT EXISTS public.stylist_blocked_dates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stylist_id UUID NOT NULL REFERENCES public.stylist_profiles(id) ON DELETE CASCADE,
  blocked_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(stylist_id, blocked_date)
);

ALTER TABLE public.stylist_blocked_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stylists can manage own blocked dates"
ON public.stylist_blocked_dates FOR ALL
USING (stylist_id IN (SELECT id FROM stylist_profiles WHERE user_id = auth.uid()));

-- Add audit log table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  action TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
ON public.audit_logs FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add service_id to appointments (optional foreign key)
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES public.stylist_services(id) ON DELETE SET NULL;

-- Update triggers
CREATE TRIGGER update_stylist_services_updated_at
BEFORE UPDATE ON public.stylist_services
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to update stylist rating
CREATE OR REPLACE FUNCTION public.update_stylist_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE stylist_profiles
  SET 
    average_rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE stylist_id = NEW.stylist_id),
    total_reviews = (SELECT COUNT(*) FROM reviews WHERE stylist_id = NEW.stylist_id)
  WHERE id = NEW.stylist_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_stylist_rating_on_review
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.update_stylist_rating();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_stylist_services_stylist_id ON public.stylist_services(stylist_id);
CREATE INDEX IF NOT EXISTS idx_reviews_stylist_id ON public.reviews(stylist_id);
CREATE INDEX IF NOT EXISTS idx_reviews_client_id ON public.reviews(client_id);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_stylist_id ON public.stylist_blocked_dates(stylist_id);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_date ON public.stylist_blocked_dates(blocked_date);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON public.audit_logs(table_name);

COMMENT ON TABLE public.stylist_services IS 'Service offerings with pricing for each stylist';
COMMENT ON TABLE public.reviews IS 'Client reviews and ratings for stylists';
COMMENT ON TABLE public.stylist_blocked_dates IS 'Dates when stylist is unavailable (vacation, holidays)';
COMMENT ON TABLE public.audit_logs IS 'Audit trail for important data changes';
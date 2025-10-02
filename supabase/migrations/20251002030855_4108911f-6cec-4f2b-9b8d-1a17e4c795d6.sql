-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('stylist', 'client', 'admin');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Create function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create stylist_profiles table
CREATE TABLE public.stylist_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  business_name TEXT,
  bio TEXT,
  color_line TEXT, -- e.g., "Wella", "Redken", "Schwarzkopf"
  years_experience INTEGER,
  specialty TEXT,
  location TEXT,
  commission_rate DECIMAL(5,2) DEFAULT 0.00,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create client_profiles table
CREATE TABLE public.client_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  preferred_stylist_id UUID REFERENCES public.stylist_profiles(id) ON DELETE SET NULL,
  hair_type TEXT,
  allergies TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create formulas table
CREATE TABLE public.formulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id UUID REFERENCES public.stylist_profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.client_profiles(id) ON DELETE CASCADE NOT NULL,
  formula_text TEXT NOT NULL,
  instructions TEXT,
  hair_photo_url TEXT,
  color_line TEXT,
  result_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id UUID REFERENCES public.stylist_profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.client_profiles(id) ON DELETE CASCADE NOT NULL,
  appointment_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 90,
  service_type TEXT NOT NULL,
  status TEXT DEFAULT 'scheduled', -- scheduled, confirmed, completed, cancelled
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create messages table for communication
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  message_text TEXT,
  video_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.client_profiles(id) ON DELETE CASCADE NOT NULL,
  stylist_id UUID REFERENCES public.stylist_profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, completed, refunded
  payment_method TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create commissions table
CREATE TABLE public.commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id UUID REFERENCES public.stylist_profiles(id) ON DELETE CASCADE NOT NULL,
  product_name TEXT NOT NULL,
  product_url TEXT,
  commission_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, paid
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create knowledge_resources table
CREATE TABLE public.knowledge_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT, -- e.g., "color_theory", "skin_tone", "problem_solving"
  is_free BOOLEAN DEFAULT true,
  resource_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stylist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_resources ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for stylist_profiles
CREATE POLICY "Anyone can view stylist profiles" ON public.stylist_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Stylists can update own profile" ON public.stylist_profiles FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Stylists can insert own profile" ON public.stylist_profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- RLS Policies for client_profiles
CREATE POLICY "Clients can view own profile" ON public.client_profiles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Stylists can view their clients" ON public.client_profiles FOR SELECT TO authenticated USING (
  preferred_stylist_id IN (SELECT id FROM public.stylist_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Clients can update own profile" ON public.client_profiles FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Clients can insert own profile" ON public.client_profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- RLS Policies for formulas
CREATE POLICY "Stylists can view own formulas" ON public.formulas FOR SELECT TO authenticated USING (
  stylist_id IN (SELECT id FROM public.stylist_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Clients can view their formulas" ON public.formulas FOR SELECT TO authenticated USING (
  client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Stylists can create formulas" ON public.formulas FOR INSERT TO authenticated WITH CHECK (
  stylist_id IN (SELECT id FROM public.stylist_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Stylists can update own formulas" ON public.formulas FOR UPDATE TO authenticated USING (
  stylist_id IN (SELECT id FROM public.stylist_profiles WHERE user_id = auth.uid())
);

-- RLS Policies for appointments
CREATE POLICY "Stylists can view own appointments" ON public.appointments FOR SELECT TO authenticated USING (
  stylist_id IN (SELECT id FROM public.stylist_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Clients can view their appointments" ON public.appointments FOR SELECT TO authenticated USING (
  client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Clients can create appointments" ON public.appointments FOR INSERT TO authenticated WITH CHECK (
  client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Stylists can update appointments" ON public.appointments FOR UPDATE TO authenticated USING (
  stylist_id IN (SELECT id FROM public.stylist_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Clients can update their appointments" ON public.appointments FOR UPDATE TO authenticated USING (
  client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid())
);

-- RLS Policies for messages
CREATE POLICY "Users can view messages they sent" ON public.messages FOR SELECT TO authenticated USING (sender_id = auth.uid());
CREATE POLICY "Users can view messages sent to them" ON public.messages FOR SELECT TO authenticated USING (recipient_id = auth.uid());
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid());
CREATE POLICY "Recipients can update read status" ON public.messages FOR UPDATE TO authenticated USING (recipient_id = auth.uid());

-- RLS Policies for payments
CREATE POLICY "Stylists can view own payments" ON public.payments FOR SELECT TO authenticated USING (
  stylist_id IN (SELECT id FROM public.stylist_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Clients can view their payments" ON public.payments FOR SELECT TO authenticated USING (
  client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "System can create payments" ON public.payments FOR INSERT TO authenticated WITH CHECK (true);

-- RLS Policies for commissions
CREATE POLICY "Stylists can view own commissions" ON public.commissions FOR SELECT TO authenticated USING (
  stylist_id IN (SELECT id FROM public.stylist_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "System can create commissions" ON public.commissions FOR INSERT TO authenticated WITH CHECK (true);

-- RLS Policies for knowledge_resources
CREATE POLICY "Everyone can view free resources" ON public.knowledge_resources FOR SELECT TO authenticated USING (is_free = true);
CREATE POLICY "Everyone can view all resources" ON public.knowledge_resources FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage resources" ON public.knowledge_resources FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.stylist_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.client_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.formulas FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for hair photos
INSERT INTO storage.buckets (id, name, public) VALUES ('hair-photos', 'hair-photos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('client-videos', 'client-videos', false);

-- Storage policies for hair photos
CREATE POLICY "Anyone can view hair photos" ON storage.objects FOR SELECT USING (bucket_id = 'hair-photos');
CREATE POLICY "Authenticated users can upload hair photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'hair-photos' AND auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own photos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'hair-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'hair-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for client videos
CREATE POLICY "Stylists can view client videos" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'client-videos');
CREATE POLICY "Clients can upload videos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'client-videos' AND auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own videos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'client-videos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own videos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'client-videos' AND auth.uid()::text = (storage.foldername(name))[1]);
-- Fix RLS policies for profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Fix RLS policies for stylist_profiles table
DROP POLICY IF EXISTS "Stylists can view their own profile" ON public.stylist_profiles;
DROP POLICY IF EXISTS "Stylists can update their own profile" ON public.stylist_profiles;
DROP POLICY IF EXISTS "Stylists can insert their own profile" ON public.stylist_profiles;

CREATE POLICY "Stylists can view their own profile" 
ON public.stylist_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Stylists can update their own profile" 
ON public.stylist_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Stylists can insert their own profile" 
ON public.stylist_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);
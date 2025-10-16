-- Create intake form templates table
CREATE TABLE public.intake_form_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id UUID REFERENCES stylist_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  is_global BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create intake form responses table
CREATE TABLE public.intake_form_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES intake_form_templates(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES client_profiles(id) ON DELETE CASCADE NOT NULL,
  stylist_id UUID REFERENCES stylist_profiles(id) ON DELETE CASCADE NOT NULL,
  responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(template_id, client_id)
);

-- Create aftercare templates table
CREATE TABLE public.aftercare_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id UUID REFERENCES stylist_profiles(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tips JSONB DEFAULT '[]'::jsonb,
  products JSONB DEFAULT '[]'::jsonb,
  is_global BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.intake_form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intake_form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aftercare_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for intake_form_templates
CREATE POLICY "Stylists can manage their templates"
  ON public.intake_form_templates
  FOR ALL
  USING (stylist_id IN (SELECT id FROM stylist_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Everyone can view global templates"
  ON public.intake_form_templates
  FOR SELECT
  USING (is_global = true);

-- RLS Policies for intake_form_responses
CREATE POLICY "Stylists can view their client responses"
  ON public.intake_form_responses
  FOR SELECT
  USING (stylist_id IN (SELECT id FROM stylist_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Clients can view their own responses"
  ON public.intake_form_responses
  FOR SELECT
  USING (client_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Clients can submit responses"
  ON public.intake_form_responses
  FOR INSERT
  WITH CHECK (client_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Clients can update their responses"
  ON public.intake_form_responses
  FOR UPDATE
  USING (client_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid()));

-- RLS Policies for aftercare_templates
CREATE POLICY "Stylists can manage their aftercare templates"
  ON public.aftercare_templates
  FOR ALL
  USING (stylist_id IN (SELECT id FROM stylist_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Everyone can view global aftercare templates"
  ON public.aftercare_templates
  FOR SELECT
  USING (is_global = true);

CREATE POLICY "Clients can view aftercare from their stylist"
  ON public.aftercare_templates
  FOR SELECT
  USING (
    stylist_id IN (
      SELECT preferred_stylist_id FROM client_profiles WHERE user_id = auth.uid()
    )
  );

-- Insert global intake form template
INSERT INTO public.intake_form_templates (name, description, fields, is_global, stylist_id) VALUES
(
  'New Client Consultation Form',
  'Comprehensive intake form for new clients',
  '[
    {"id": "hair_history", "label": "Hair History", "type": "textarea", "required": true, "placeholder": "Previous treatments, chemical services, etc."},
    {"id": "current_concerns", "label": "Current Hair Concerns", "type": "textarea", "required": true, "placeholder": "What would you like to address?"},
    {"id": "desired_result", "label": "Desired Result", "type": "textarea", "required": true, "placeholder": "Your hair goals"},
    {"id": "allergies_detailed", "label": "Known Allergies or Sensitivities", "type": "textarea", "required": true, "placeholder": "List any allergies or product sensitivities"},
    {"id": "scalp_condition", "label": "Scalp Condition", "type": "select", "required": true, "options": ["Normal", "Dry", "Oily", "Sensitive", "Dandruff"]},
    {"id": "hair_texture", "label": "Hair Texture", "type": "select", "required": true, "options": ["Fine", "Medium", "Coarse", "Thick", "Thin"]},
    {"id": "maintenance_level", "label": "Maintenance Preference", "type": "select", "required": true, "options": ["Low (wash and go)", "Medium (some styling)", "High (daily styling)"]},
    {"id": "budget", "label": "Budget Range", "type": "select", "required": false, "options": ["$50-100", "$100-200", "$200-300", "$300+"]},
    {"id": "lifestyle", "label": "Lifestyle Notes", "type": "textarea", "required": false, "placeholder": "Work environment, exercise routine, etc."}
  ]'::jsonb,
  true,
  NULL
);

-- Insert global aftercare templates
INSERT INTO public.aftercare_templates (service_type, title, content, tips, products, is_global, stylist_id) VALUES
(
  'Color',
  'Color Care Instructions',
  'Your new color looks amazing! Here''s how to keep it vibrant and healthy.',
  '[
    "Wait 24-48 hours before shampooing to allow color to fully set",
    "Use sulfate-free shampoo and conditioner designed for color-treated hair",
    "Wash hair in cool/lukewarm water to preserve color",
    "Minimize heat styling and always use heat protectant",
    "Avoid chlorine and saltwater - wear a swim cap",
    "Use a deep conditioning treatment once a week",
    "Book your touch-up appointment in 6-8 weeks"
  ]'::jsonb,
  '[
    "Color-safe sulfate-free shampoo",
    "Moisturizing conditioner for color-treated hair",
    "Leave-in conditioning spray",
    "Heat protectant spray",
    "Weekly deep conditioning mask"
  ]'::jsonb,
  true,
  NULL
),
(
  'Keratin Treatment',
  'Keratin Treatment Aftercare',
  'Your keratin treatment will keep your hair smooth and manageable. Follow these guidelines for best results.',
  '[
    "Do not wash hair for 48-72 hours after treatment",
    "Avoid tying hair up, using clips, or creating any creases for 3 days",
    "Sleep on a silk pillowcase to prevent creasing",
    "Use sulfate-free and sodium chloride-free products only",
    "Avoid swimming in chlorinated water for 2 weeks",
    "Minimize heat styling - keratin reduces frizz naturally",
    "Schedule your next treatment in 3-4 months"
  ]'::jsonb,
  '[
    "Sulfate-free keratin-safe shampoo",
    "Keratin-safe conditioner",
    "Silk pillowcase",
    "Argan oil or keratin serum"
  ]'::jsonb,
  true,
  NULL
),
(
  'Highlights/Balayage',
  'Highlights & Balayage Care Guide',
  'Your dimensional color needs special care to stay bright and beautiful.',
  '[
    "Use purple/blue toning shampoo 1-2 times per week to prevent brassiness",
    "Deep condition weekly to maintain moisture balance",
    "Protect hair from UV damage with UV protection spray",
    "Limit heat styling to preserve the integrity of lightened hair",
    "Use a wide-tooth comb when detangling wet hair",
    "Apply hair oils to ends to prevent dryness",
    "Book your toner refresh in 4-6 weeks, full service in 10-12 weeks"
  ]'::jsonb,
  '[
    "Purple/blue toning shampoo",
    "Hydrating conditioner",
    "UV protection hair spray",
    "Nourishing hair oil",
    "Deep conditioning mask"
  ]'::jsonb,
  true,
  NULL
),
(
  'Cut & Style',
  'Haircut Maintenance Guide',
  'Keep your fresh cut looking sharp with these maintenance tips.',
  '[
    "Wash hair as needed based on your hair type (2-3 times per week average)",
    "Use appropriate products for your hair texture and style",
    "Trim bangs or face-framing pieces between appointments if needed",
    "Protect hair while sleeping with silk/satin pillowcase",
    "Use heat protectant before any heat styling",
    "Book your next haircut in 6-8 weeks to maintain shape",
    "Ask your stylist about styling tips specific to your cut"
  ]'::jsonb,
  '[
    "Shampoo and conditioner for your hair type",
    "Styling product (mousse, gel, cream, pomade)",
    "Heat protectant spray",
    "Quality hair dryer and/or styling iron"
  ]'::jsonb,
  true,
  NULL
);
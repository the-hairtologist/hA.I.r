-- Security Fix: Create secure role assignment function
-- This prevents privilege escalation by only allowing client/stylist roles during signup
CREATE OR REPLACE FUNCTION public.assign_user_role(_user_id uuid, _role app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow role assignment if user doesn't have a role yet
  IF NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = _user_id) THEN
    -- Explicitly block 'admin' role - only 'client' and 'stylist' allowed for self-signup
    IF _role IN ('client', 'stylist') THEN
      INSERT INTO user_roles (user_id, role) VALUES (_user_id, _role);
    ELSE
      RAISE EXCEPTION 'Invalid role for self-assignment. Only client and stylist roles are allowed.';
    END IF;
  ELSE
    RAISE EXCEPTION 'User already has a role assigned';
  END IF;
END;
$$;

-- Security Fix: Add medical data consent field to client_profiles
ALTER TABLE public.client_profiles 
ADD COLUMN IF NOT EXISTS medical_info_consent boolean DEFAULT false;

COMMENT ON COLUMN public.client_profiles.medical_info_consent IS 'Indicates whether the client has consented to sharing medical information (allergies) with their stylist';

-- Security Fix: Move knowledge base seeding to migration (run once)
-- Check if knowledge base is empty before seeding
DO $$
DECLARE
  existing_count integer;
BEGIN
  SELECT COUNT(*) INTO existing_count FROM knowledge_resources;
  
  IF existing_count = 0 THEN
    -- Insert sample knowledge data
    INSERT INTO knowledge_resources (title, category, content, is_free) VALUES
    ('Understanding Hair Color Levels', 'Color Theory', 'Hair color levels range from 1 (darkest black) to 10 (lightest blonde). Understanding levels is crucial for:

- Assessing starting hair color
- Determining how much lift is needed
- Selecting the right developer strength
- Predicting color results

Key Guidelines:
• Level 1-3: Black to darkest brown
• Level 4-5: Medium to light brown
• Level 6-7: Dark to medium blonde
• Level 8-10: Light to platinum blonde

Remember: You can only lift hair color, not deposit darker without pre-pigmentation.', true),
    
    ('Toner Application Basics', 'Techniques', 'Toners are essential for refining blonde and highlighted hair:

When to Use Toners:
• After bleaching to neutralize brassiness
• To add depth to blonde hair
• For color correction
• To enhance cool or warm tones

Application Tips:
1. Always apply to towel-dried hair
2. Use 10 or 20 volume developer (never higher)
3. Process for 10-20 minutes maximum
4. Check progress every 5 minutes

Common Toner Shades:
• Violet: Neutralizes yellow
• Blue: Neutralizes orange
• Green: Neutralizes red', true),
    
    ('Balayage Technique Guide', 'Techniques', 'Balayage is a freehand highlighting technique for natural-looking dimension:

Essential Steps:
1. Section hair properly (triangle or horizontal sections)
2. Apply lighter to heavier from mid-lengths to ends
3. Use a sweeping motion (balayage means "to sweep")
4. Feather the product for seamless blending
5. Process with or without foils based on desired lift

Pro Tips:
• Keep highlights fine and diffused at the root
• Go heavier on the underneath layers
• Face-framing pieces should be brightest
• Always tone after lifting', true),
    
    ('Color Aftercare: First 48 Hours', 'Aftercare', 'The first two days after coloring are crucial for longevity:

Critical Rules:
• Wait 48-72 hours before washing
• Avoid heat styling during this period
• Don''t tie hair tightly (can cause color bleeding)
• Keep hair dry - avoid rain, swimming, heavy sweating
• Sleep on a silk or satin pillowcase

Why Wait?
Your hair cuticles need time to fully close and seal in the color.', true),
    
    ('Protecting Color-Treated Hair', 'Color Maintenance', 'Keep your color vibrant and lasting longer with these essential tips:

Must-Do''s:
✓ Use sulfate-free, color-safe shampoos
✓ Wash with cool or lukewarm water
✓ Apply UV protection products before sun exposure
✓ Deep condition weekly
✓ Limit heat styling to 2-3 times per week', true);
  END IF;
END $$;
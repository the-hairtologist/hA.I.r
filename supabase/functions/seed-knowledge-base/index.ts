import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const sampleKnowledge = [
  // Stylist Resources
  {
    title: "Understanding Hair Color Levels",
    category: "Color Theory",
    content: `Hair color levels range from 1 (darkest black) to 10 (lightest blonde). Understanding levels is crucial for:

- Assessing starting hair color
- Determining how much lift is needed
- Selecting the right developer strength
- Predicting color results

Key Guidelines:
• Level 1-3: Black to darkest brown
• Level 4-5: Medium to light brown
• Level 6-7: Dark to medium blonde
• Level 8-10: Light to platinum blonde

Remember: You can only lift hair color, not deposit darker without pre-pigmentation.`,
    is_free: true,
  },
  {
    title: "Toner Application Basics",
    category: "Techniques",
    content: `Toners are essential for refining blonde and highlighted hair:

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
• Green: Neutralizes red`,
    is_free: true,
  },
  {
    title: "Balayage Technique Guide",
    category: "Techniques",
    content: `Balayage is a freehand highlighting technique for natural-looking dimension:

Essential Steps:
1. Section hair properly (triangle or horizontal sections)
2. Apply lighter to heavier from mid-lengths to ends
3: Use a sweeping motion (balayage means "to sweep")
4. Feather the product for seamless blending
5. Process with or without foils based on desired lift

Pro Tips:
• Keep highlights fine and diffused at the root
• Go heavier on the underneath layers
• Face-framing pieces should be brightest
• Always tone after lifting`,
    is_free: true,
  },
  {
    title: "Developer Strength Selection",
    category: "Formulation",
    content: `Choosing the right developer volume is critical for results:

Developer Volumes:
• 10 Volume (3%): Deposit only, darkening, or same level
• 20 Volume (6%): 1-2 levels of lift, standard for most applications
• 30 Volume (9%): 2-3 levels of lift, use with caution
• 40 Volume (12%): 3-4 levels of lift, high-lift only

Guidelines:
- Higher volume = more lift but more damage
- Gray coverage typically uses 20 volume
- On-scalp bleach: maximum 30 volume
- Off-scalp bleach: can use 40 volume
- Always consider hair condition before selecting`,
    is_free: true,
  },
  
  // Client Resources
  {
    title: "Color Aftercare: First 48 Hours",
    category: "Aftercare",
    content: `The first two days after coloring are crucial for longevity:

Critical Rules:
• Wait 48-72 hours before washing
• Avoid heat styling during this period
• Don't tie hair tightly (can cause color bleeding)
• Keep hair dry - avoid rain, swimming, heavy sweating
• Sleep on a silk or satin pillowcase

Why Wait?
Your hair cuticles need time to fully close and seal in the color. Washing too soon can cause:
- Premature color fading
- Uneven color distribution
- Loss of vibrancy
- Reduced color longevity

After 48 hours, use color-safe, sulfate-free products for best results.`,
    is_free: true,
  },
  {
    title: "Protecting Color-Treated Hair",
    category: "Color Maintenance",
    content: `Keep your color vibrant and lasting longer with these essential tips:

Must-Do's:
✓ Use sulfate-free, color-safe shampoos
✓ Wash with cool or lukewarm water (hot water opens cuticles)
✓ Apply UV protection products before sun exposure
✓ Deep condition weekly
✓ Limit heat styling to 2-3 times per week

Avoid:
✗ Chlorine and salt water without protection
✗ Over-washing (2-3 times per week maximum)
✗ Hot tools above 350°F without heat protectant
✗ Harsh clarifying shampoos

Color-Extending Products:
• Purple shampoo for blonde/silver tones (once weekly)
• Color-depositing conditioners
• Leave-in treatments with UV filters
• Glossing treatments between salon visits`,
    is_free: true,
  },
  {
    title: "Extension Care Guide",
    category: "Extension Care",
    content: `Proper care ensures your extensions stay beautiful and last longer:

Daily Care:
• Brush 2-3 times daily with a loop brush (start from ends)
• Use a silk/satin pillowcase or braid before bed
• Avoid products near bonds/tape
• Keep extensions moisturized but scalp clean

Washing Tips:
1. Brush thoroughly before wetting
2. Wash in downward motions (never scrub)
3. Use sulfate-free products
4. Condition from mid-lengths to ends only
5. Gently squeeze water out - don't wring
6. Air dry when possible or use cool setting

What to Avoid:
✗ Sleeping with wet extensions
✗ Oil-based products near attachment points
✗ High heat without protection
✗ Going more than 2 days without brushing
✗ Swimming without protective measures

Maintenance Schedule:
• Tape-ins: Move up every 6-8 weeks
• Sew-ins: Tighten every 6-8 weeks
• Fusion/keratin: Reapply every 3-4 months`,
    is_free: true,
  },
  {
    title: "Best Products for Your Hair Type",
    category: "Product Tips",
    content: `Choosing the right products makes all the difference:

Fine/Thin Hair:
• Volumizing shampoos without heavy sulfates
• Lightweight leave-in sprays
• Root-lifting sprays
• Avoid heavy oils and thick conditioners

Thick/Coarse Hair:
• Moisturizing shampoos and deep conditioners
• Rich hair masks weekly
• Anti-frizz serums and oils
• Smoothing creams for styling

Curly/Textured Hair:
• Co-washing or gentle cleansers
• Leave-in conditioners (essential)
• Curl-defining creams
• Diffuser attachment for blow-drying

Color-Treated:
• Sulfate-free, color-safe formulas
• Purple shampoo for blondes (weekly)
• Weekly hair masks
• UV protection products

Heat-Damaged:
• Bond-building treatments
• Heat protectants before every styling
• Protein treatments monthly
• Trim regularly to remove damage`,
    is_free: true,
  },
  {
    title: "Hair Health Dos and Don'ts",
    category: "Hair Health",
    content: `Essential habits for maintaining healthy, beautiful hair:

DO:
✓ Trim every 6-8 weeks to prevent split ends
✓ Use a wide-tooth comb on wet hair
✓ Apply heat protectant before any hot tools
✓ Deep condition weekly
✓ Protect hair from sun, chlorine, and salt water
✓ Sleep on silk/satin to reduce friction
✓ Eat a balanced diet rich in proteins and vitamins
✓ Stay hydrated (water benefits your hair!)

DON'T:
✗ Brush wet hair aggressively (causes breakage)
✗ Use heat tools above 400°F
✗ Tie hair in tight styles while sleeping
✗ Over-process with chemical treatments
✗ Wash daily (strips natural oils)
✗ Use products with harsh sulfates
✗ Skip heat protectant
✗ Neglect scalp health

Signs Your Hair Needs Help:
• Excessive breakage
• Dull, lifeless appearance
• Split ends traveling up the shaft
• Tangles easily
• Lacks elasticity

If you notice these signs, consult your stylist for a treatment plan!`,
    is_free: true,
  },
  {
    title: "Extending Time Between Salon Visits",
    category: "Color Maintenance",
    content: `Professional tips to keep your look fresh longer:

Between Color Appointments:
• Use color-depositing shampoos/conditioners
• Touch up roots with temporary root sprays
• Apply hair glosses at home
• Minimize washing frequency
• Use dry shampoo strategically

For Highlights/Balayage:
• Purple shampoo maintains tone (blondes)
• Face-framing highlights fade first - prioritize these
• Glossing treatments add shine and tone
• Consider toner touch-ups at 4-6 weeks

For Haircuts:
• Learn to trim your own bangs between cuts
• Use styling techniques to refresh your look
• Invest in quality styling tools
• Try different partings to change appearance
• Use volumizing products at roots

Money-Saving Tips:
💡 Book appointments strategically (avoid peak times)
💡 Maintain healthy hair = less corrective work needed
💡 Ask your stylist about lower-maintenance options
💡 Invest in quality home care products
💡 Learn basic styling skills

When to Never Skip the Salon:
⚠️ Root touch-ups on all-over color (6-8 weeks)
⚠️ Color corrections
⚠️ Major cuts or style changes
⚠️ Chemical treatments (perms, straightening)
⚠️ Extension maintenance`,
    is_free: true,
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Seeding knowledge base with sample data...');

    // Check if knowledge already exists
    const { data: existing } = await supabase
      .from('knowledge_resources')
      .select('id')
      .limit(1);

    if (existing && existing.length > 0) {
      console.log('Knowledge base already has data, skipping seed');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Knowledge base already populated',
          skipped: true 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Insert sample knowledge
    const { error } = await supabase
      .from('knowledge_resources')
      .insert(sampleKnowledge);

    if (error) {
      throw error;
    }

    console.log('Successfully seeded knowledge base');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Added ${sampleKnowledge.length} knowledge resources`,
        count: sampleKnowledge.length 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error seeding knowledge base:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: String(error)
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
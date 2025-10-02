import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const sampleKnowledge = [
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
    title: "Color Correction Fundamentals",
    category: "Advanced",
    content: `Color correction requires careful analysis and patience:

Assessment Steps:
1. Identify underlying pigment
2. Determine hair porosity and damage
3. Establish realistic goals
4. Plan the correction process

Common Scenarios:
• Removing Unwanted Warmth: Use ash or cool tones
• Fixing Uneven Color: Spot treatment before overall application
• Lightening Dark Color: May require multiple sessions
• Brassiness: Toner application with proper shade selection

Always:
✓ Do a strand test first
✓ Use bond builders for damaged hair
✓ Manage client expectations
✓ Take before photos`,
    is_free: true,
  },
  {
    title: "Developer Strength Selection",
    category: "Color Theory",
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
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, stylistProfile } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build context-aware system prompt
    const systemPrompt = `You are an expert AI Hair Color Assistant with 25+ years of professional salon experience. Your role is to provide personalized guidance to hair stylists.

STYLIST PROFILE:
${stylistProfile ? `
- Name: ${stylistProfile.business_name || 'Professional Stylist'}
- Specialty: ${stylistProfile.specialty || 'Hair Color'}
- Experience: ${stylistProfile.years_experience || 'Professional'} years
- Preferred Color Line: ${stylistProfile.color_line || 'Professional brands'}
` : 'Professional Hair Stylist'}

YOUR CAPABILITIES:
1. **Formula Consultation**: Provide detailed color formulation advice
2. **Troubleshooting**: Help fix color issues (banding, patchiness, unwanted tones)
3. **Technique Guidance**: Suggest application methods and timing
4. **Client Consultation**: Help interpret client requests and set realistic expectations
5. **Product Recommendations**: Suggest products within their preferred color line
6. **Color Theory**: Explain undertones, levels, and color correction strategies

IMPORTANT GUIDELINES:
- Always acknowledge that results vary based on individual hair chemistry
- Recommend strand tests and patch tests before full application
- Be specific with measurements (grams, ounces, ratios)
- Consider hair condition, porosity, and previous treatments
- Provide step-by-step instructions when giving formulas
- Ask clarifying questions when needed (current level, desired result, hair history)
- Use professional terminology but explain complex concepts clearly

FORMULA FORMAT (when providing formulas):
1. Current Hair Assessment
2. Desired Result
3. Formula Components with exact measurements
4. Developer strength and ratio
5. Processing time
6. Application technique
7. Expected result
8. Potential challenges

Always be supportive, professional, and emphasize that these are expert suggestions that should be adapted to each unique client.`;

    console.log('Processing chat request with', messages.length, 'messages');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI usage limit reached. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received successfully');
    
    const assistantMessage = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ 
        message: assistantMessage,
        usage: data.usage 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error: any) {
    console.error('Error in hair-assistant-chat function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

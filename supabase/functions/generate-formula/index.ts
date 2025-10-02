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
    const { hairDescription, colorLine, clientNotes, imageAnalysis } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are a master hair colorist with 20+ years of experience specializing in ${colorLine || 'professional hair color'}. 
Your task is to provide 2-3 detailed hair color formulas with step-by-step instructions.

Format your response as a JSON array with this structure:
[
  {
    "formula_name": "Formula Option 1",
    "formula_text": "Detailed formula with exact measurements (e.g., 30g 7N + 60ml 20vol developer)",
    "instructions": "Step-by-step instructions numbered 1-10",
    "processing_time": "30-45 minutes",
    "expected_result": "Description of expected color result",
    "difficulty": "beginner/intermediate/advanced"
  }
]

Consider:
- Hair condition and health
- Natural hair level and undertones
- Desired result vs realistic outcome
- Application technique
- Safety and patch test recommendations`;

    const userPrompt = `Client hair description: ${hairDescription}
${imageAnalysis ? `Hair photo analysis: ${imageAnalysis}` : ''}
${clientNotes ? `Additional notes: ${clientNotes}` : ''}

Please provide 2-3 formula options with complete instructions.`;

    console.log('Calling AI Gateway for formula generation...');
    
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
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
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
    console.log('AI response received');
    
    const aiContent = data.choices[0].message.content;
    
    // Try to parse JSON from the response
    let formulas;
    try {
      // Extract JSON array from markdown code blocks if present
      const jsonMatch = aiContent.match(/```json\n?([\s\S]*?)\n?```/) || aiContent.match(/\[([\s\S]*)\]/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : aiContent;
      formulas = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // If JSON parsing fails, return the raw content
      formulas = [{
        formula_name: "AI Generated Formula",
        formula_text: aiContent,
        instructions: "See formula text for details",
        processing_time: "30-45 minutes",
        expected_result: "Professional color result",
        difficulty: "intermediate"
      }];
    }

    return new Response(
      JSON.stringify({ formulas }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error: any) {
    console.error('Error in generate-formula function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

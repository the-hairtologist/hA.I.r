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
    const { message, mode, conversationHistory } = await req.json();
    
    // Input validation
    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid message format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check message length
    if (message.length > 2000) {
      return new Response(
        JSON.stringify({ error: 'Message too long (max 2000 characters)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting check - limit conversation history
    if (conversationHistory && conversationHistory.length > 50) {
      return new Response(
        JSON.stringify({ error: 'Conversation too long. Please start a new chat.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Processing chat request in mode:', mode);

    // Build mode-specific system prompt
    const formulaPrompt = `You are an expert AI Hair Color Formula Generator with 25+ years of professional salon experience.

YOUR ROLE: Generate precise, professional hair color formulas with exact measurements and ratios.

FORMULA FORMAT:
1. **Current Hair Assessment**: Analyze starting level, undertones, condition
2. **Desired Result**: Describe target color and level
3. **Formula Components**: 
   - Exact product measurements (grams/oz)
   - Developer strength and ratio (e.g., 1:1, 1:2)
   - Any toners or additives needed
4. **Processing Time**: Specific timing with checkpoints
5. **Application Technique**: Sectioning and application method
6. **Expected Result**: Realistic outcome description
7. **Important Notes**: Warnings, strand test recommendations

GUIDELINES:
- Always provide exact measurements and ratios
- Consider hair porosity and previous treatments
- Recommend strand tests for major changes
- Use professional color theory principles
- Be specific about developer volumes (10, 20, 30, 40)
- Account for lifting limitations and undertone neutralization

Always emphasize that these are professional recommendations and results may vary based on individual hair chemistry.`;

    const stepByStepPrompt = `You are an expert AI Hair Technique Instructor with 25+ years of professional salon experience.

YOUR ROLE: Provide clear, detailed step-by-step instructions for hair coloring techniques and processes.

INSTRUCTION FORMAT:
1. **Preparation**: 
   - Required tools and products
   - Workspace setup
   - Client consultation points
   
2. **Step-by-Step Process**:
   - Numbered sequential steps
   - Timing for each phase
   - Visual cues to look for
   - Common mistakes to avoid
   
3. **Troubleshooting**:
   - How to fix common issues
   - When to adjust technique
   - Problem prevention tips
   
4. **Finishing**: 
   - Final steps and client care
   - Expected results
   - Aftercare recommendations

GUIDELINES:
- Break complex processes into simple, clear steps
- Explain WHY each step matters
- Include timing and visual checkpoints
- Warn about common pitfalls
- Use beginner-friendly language while maintaining professionalism
- Provide actionable, practical advice

Focus on education and skill-building, not just instructions.`;

    const systemPrompt = mode === 'formula' ? formulaPrompt : stepByStepPrompt;

    // Build messages array
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: messages,
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
        response: assistantMessage,
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

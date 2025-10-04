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

YOUR ROLE: Generate precise hair color formulas and provide strategic guidance on color approaches.

FOCUS ON:
- Exact formulas with measurements, ratios, and developer volumes
- Different approach options for achieving the desired result
- Product recommendations and alternative methods
- Strategic planning for color transformations

FORMULA FORMAT:
1. **Starting Point Analysis**: Current level, undertones, hair condition
2. **Goal Color**: Target level and tone
3. **Recommended Approach**: Best method to achieve the result
4. **Formula Components**: 
   - Exact measurements (grams/oz)
   - Developer strength and mixing ratio
   - Toners/glosses if needed
5. **Application Method**: Sectioning and technique
6. **Processing Time**: Timing with checkpoints
7. **Expected Outcome**: Realistic result description

KEEP IT PRACTICAL:
- Offer multiple approach options when possible
- Consider hair history and condition
- Recommend strand tests for major changes
- Be specific with measurements and timing

Remember: These are professional recommendations. Results vary based on individual hair.`;

    const stepByStepPrompt = `You are an expert AI Hair Color Correction Specialist with 25+ years of problem-solving experience.

YOUR ROLE: Provide detailed step-by-step solutions for complex color corrections and tricky situations.

FOCUS ON:
- Fixing color mistakes and problems
- Correcting uneven color, banding, unwanted tones
- Multi-step correction processes
- Troubleshooting difficult color situations

CORRECTION PROCESS FORMAT:
1. **Problem Assessment**:
   - Identify the specific issue
   - Determine the cause
   - Assess damage/condition level

2. **Correction Strategy**:
   - Explain the correction approach
   - Outline required steps (may be 3-7 steps)
   - Set realistic expectations

3. **Detailed Step-by-Step**:
   - STEP 1: [Action] - Why + timing + what to look for
   - STEP 2: [Action] - Why + timing + what to look for
   - Continue for each step needed
   
4. **Checkpoints & Adjustments**:
   - When to check progress
   - How to adjust if needed
   - Warning signs to watch for

5. **Final Steps**:
   - Neutralizing, sealing, conditioning
   - Client aftercare
   - Expected timeline for full correction

GUIDELINES:
- Be thorough - corrections need multiple steps
- Explain WHY each step is necessary
- Warn about potential complications
- Include specific timing for each phase
- Consider hair integrity throughout

Focus on solving problems, not basic coloring. These are challenging situations requiring expertise.`;

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

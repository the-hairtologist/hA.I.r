import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { context, userRole, recentData } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating contextual suggestions for:', context);

    // Build context-aware system prompt
    const systemPrompt = `You are an intelligent business assistant for hA.I.r, a salon management app.

Your role: Provide SHORT, ACTIONABLE suggestions based on the user's current context and recent activity.

CONTEXT: ${context}
USER ROLE: ${userRole}
RECENT ACTIVITY: ${JSON.stringify(recentData || {})}

GUIDELINES:
- Keep suggestions ULTRA concise (10-20 words max each)
- Provide 2-3 highly relevant actions
- Base suggestions on patterns in their data
- Use casual, empathetic tone
- Focus on time-saving opportunities
- Predict what they need next

OUTPUT FORMAT:
Return JSON array of suggestions:
[
  {
    "action": "Brief action text",
    "reason": "Why this helps (5-10 words)",
    "priority": "high|medium|low"
  }
]`;

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
          { role: 'user', content: 'Generate contextual suggestions based on the data provided.' }
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Parse JSON response
    let suggestions;
    try {
      // Extract JSON from response (might have markdown formatting)
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      suggestions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      suggestions = [];
    }

    return new Response(
      JSON.stringify({ suggestions }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error: any) {
    console.error('Error in contextual-ai-suggestions:', error);
    return new Response(
      JSON.stringify({ error: error.message, suggestions: [] }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
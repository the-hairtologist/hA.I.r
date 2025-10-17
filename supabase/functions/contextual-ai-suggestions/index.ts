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
    const { context, userRole } = await req.json();
    
    console.log('🤖 Generating contextual AI suggestions:', { context, userRole });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const prompt = `As a hair care assistant, provide 3 contextual suggestions for a ${userRole} based on this context: ${JSON.stringify(context)}. 
    
    Return ONLY a JSON array of suggestions with this format:
    [
      {
        "title": "Short action title",
        "description": "Brief description",
        "action": "action_type",
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
          { role: 'system', content: 'You are a helpful hair care assistant. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    let suggestions;
    try {
      suggestions = JSON.parse(content);
    } catch {
      suggestions = [
        {
          title: "Review recent appointments",
          description: "Check your upcoming schedule",
          action: "view_appointments",
          priority: "medium"
        }
      ];
    }

    console.log('✅ Generated suggestions:', suggestions.length);
    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('❌ Error generating suggestions:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
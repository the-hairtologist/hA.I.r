import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { decision, context } = await req.json();
    
    if (!decision || typeof decision !== 'string' || decision.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Valid decision description is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (decision.length > 1000) {
      return new Response(
        JSON.stringify({ error: 'Decision description must be less than 1000 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are running a multi-agent strategic simulation for salon business decisions.

Simulate a closed-door meeting between three expert personas:

1. **Marcus (Risk Analyst)**: Deeply pessimistic, data-driven. Anticipates worst-case scenarios, identifies hidden costs, and questions optimistic assumptions. Always cites specific risks.

2. **Leila (Growth Visionary)**: Wildly optimistic marketing expert. Sees opportunities everywhere, focuses on potential upside, and emphasizes growth. Sometimes overlooks practical constraints.

3. **Sora (Systems Strategist)**: Neutral, focused on second and third-order consequences. Thinks about systemic effects, unintended outcomes, and long-term sustainability.

Conduct the simulation in THREE ROUNDS:

**ROUND 1 - Opening Statements**: Each expert makes their case with specific recommendations.

**ROUND 2 - Rebuttals**: Each expert directly challenges the other two experts' points with counter-arguments.

**ROUND 3 - Final Conclusions**: Each expert provides a revised, final recommendation incorporating what they've learned.

Format clearly with headers and bullet points. Make the debate realistic and substantive.`;

    const contextInfo = context ? `\n\nAdditional Context:\n${context}` : '';
    
    console.log('Calling Lovable AI for strategy simulation');
    
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
          { role: 'user', content: `Strategic Decision: ${decision}${contextInfo}` }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please add credits in Settings.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'AI service temporarily unavailable' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const simulation = data.choices[0].message.content;

    console.log('Strategy simulation completed successfully');

    return new Response(
      JSON.stringify({ simulation }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in strategy-simulator function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

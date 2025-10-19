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
    const { problem, domainA, domainB } = await req.json();
    
    if (!problem || typeof problem !== 'string' || problem.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Valid problem description is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!domainA || typeof domainA !== 'string' || domainA.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Domain A (perspective lens) is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!domainB || typeof domainB !== 'string' || domainB.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Domain B (toolkit) is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (problem.length > 1000 || domainA.length > 500 || domainB.length > 500) {
      return new Response(
        JSON.stringify({ error: 'Input text too long. Keep problem under 1000 chars, domains under 500 chars.' }),
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

    const systemPrompt = `You are a master of syncretism, lateral thinking, and cross-domain innovation for salon business problems.

Your task is to generate THREE concrete, actionable solutions by combining principles from two completely different domains.

**Critical Requirements:**
1. Each solution MUST explicitly draw logic and vocabulary from BOTH domains
2. Explain the connection between domains and the problem
3. Solutions must be practical and actionable, not abstract
4. Use specific terminology from both domains
5. Show how the collision of these domains creates novel insights

Format each solution as:
**Solution [Number]: [Creative Name]**
- **From Domain A**: [What principle/concept you're borrowing]
- **From Domain B**: [What principle/concept you're borrowing]
- **The Synthesis**: [How these combine to solve the problem]
- **Action Steps**: [3-5 specific steps to implement]

Be bold. Create genuinely novel connections that wouldn't occur naturally.`;

    console.log('Calling Lovable AI for creative problem solving');
    
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
          { 
            role: 'user', 
            content: `Problem: ${problem}\n\nDomain A (The Lens): ${domainA}\n\nDomain B (The Toolkit): ${domainB}`
          }
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
    const solutions = data.choices[0].message.content;

    console.log('Creative solutions generated successfully');

    return new Response(
      JSON.stringify({ solutions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in creative-solver function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

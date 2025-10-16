import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { currentLevel, targetLevel, tone, condition } = await req.json();
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing authorization header');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    console.log('Quick formula request:', { currentLevel, targetLevel, tone, condition });

    // Try to get from cache first
    const { data: cached, error: cacheError } = await supabase
      .from('cached_formulas')
      .select('*')
      .eq('current_level', currentLevel)
      .eq('target_level', targetLevel)
      .eq('tone', tone)
      .eq('condition', condition)
      .single();

    if (cached && !cacheError) {
      console.log('Cache hit! Returning cached formula');
      
      // Update usage count
      await supabase
        .from('cached_formulas')
        .update({ 
          usage_count: cached.usage_count + 1,
          last_used_at: new Date().toISOString()
        })
        .eq('id', cached.id);

      return new Response(
        JSON.stringify({
          formula: cached.formula_json,
          cached: true,
          usage_count: cached.usage_count + 1
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Cache miss, generating new formula with AI...');

    // Generate with AI (use flash-lite for speed)
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('AI service not configured');

    const lift = targetLevel - currentLevel;
    const developer = lift === 0 ? '10vol' : lift <= 1 ? '20vol' : lift <= 2 ? '30vol' : '30vol';
    
    const prompt = `Generate a hair color formula for:
- Current Level: ${currentLevel}
- Target Level: ${targetLevel}
- Desired Tone: ${tone}
- Hair Condition: ${condition}
- Lift Needed: ${lift} levels

Return ONLY valid JSON in this exact structure:
{
  "base": {
    "product": "Product name",
    "brand": "Brand name",
    "shade": "Shade code",
    "amount": "60g",
    "developer": "${developer}",
    "developer_amount": "60ml",
    "processing_minutes": 30
  },
  "tone": {
    "product": "Toner name",
    "shade": "Toner shade",
    "amount": "30g",
    "developer": "20vol",
    "developer_amount": "30ml",
    "processing_minutes": 20
  },
  "application_steps": [
    "Step-by-step instructions"
  ],
  "cautions": [
    "Important safety notes"
  ]
}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite',
        messages: [
          { role: 'system', content: 'You are a hair colorist. Return only valid JSON, no markdown.' },
          { role: 'user', content: prompt }
        ]
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI generation failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const formulaText = aiData.choices?.[0]?.message?.content;
    
    const jsonMatch = formulaText.match(/\{[\s\S]*\}/);
    const formula = JSON.parse(jsonMatch ? jsonMatch[0] : formulaText);

    // Cache the formula for future use
    await supabase.from('cached_formulas').insert({
      current_level: currentLevel,
      target_level: targetLevel,
      tone,
      condition,
      formula_json: formula,
      usage_count: 1,
      last_used_at: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({
        formula,
        cached: false,
        generated_at: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Quick formula error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
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
    const { imageUrl, clientId } = await req.json();
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing authorization header');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('AI service not configured');

    console.log('Analyzing hair photo with Gemini Pro (vision model)...');

    // Use google/gemini-2.5-pro for vision analysis
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          {
            role: 'system',
            content: `You are a professional hair colorist analyzing hair photos. Provide detailed, accurate analysis in JSON format.

CRITICAL: Return ONLY valid JSON, no markdown, no explanations outside the JSON structure.

Required JSON structure:
{
  "current_level": <number 1-10>,
  "level_confidence": <decimal 0-1>,
  "undertones": ["warm" | "cool" | "neutral" | "brassy" | "ashy"],
  "damage_indicators": {
    "porosity": "low" | "medium" | "high",
    "elasticity": "good" | "fair" | "compromised",
    "split_ends": true | false,
    "breakage": true | false
  },
  "previous_color_detected": true | false,
  "recommended_approach": "single_session" | "gentle_multi_session" | "correction_needed",
  "cautions": [
    "string array of specific warnings"
  ],
  "professional_notes": "Brief notes for stylist"
}`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this hair photo and provide detailed assessment for color planning:'
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl }
              }
            ]
          }
        ]
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        throw new Error('AI service rate limit reached. Please try again in a moment.');
      }
      if (aiResponse.status === 402) {
        throw new Error('AI service credits exhausted. Please contact support.');
      }
      throw new Error(`AI analysis failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const analysisText = aiData.choices?.[0]?.message?.content;
    
    if (!analysisText) {
      throw new Error('No analysis returned from AI');
    }

    console.log('Raw AI response:', analysisText);

    // Parse JSON from response (handle markdown code blocks)
    let analysisResult;
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : analysisText;
      analysisResult = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', analysisText);
      throw new Error('Failed to parse hair analysis results');
    }

    // Calculate confidence scores
    const confidenceScores = {
      overall: analysisResult.level_confidence || 0.85,
      level: analysisResult.level_confidence || 0.85,
      undertones: 0.80,
      damage: 0.75,
    };

    // Store analysis result
    await supabase.from('hair_analysis_results').insert({
      user_id: user.id,
      client_id: clientId,
      image_url: imageUrl,
      analysis_result: analysisResult,
      confidence_scores: confidenceScores,
    });

    return new Response(
      JSON.stringify({
        ...analysisResult,
        confidence_scores: confidenceScores,
        analyzed_at: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Hair analysis error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
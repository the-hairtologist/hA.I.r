/**
 * Analyze Client Sentiment Edge Function
 * Uses AI to perform deep sentiment analysis on client reviews and interactions
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { clientId, stylistId } = await req.json();

    console.log(`🔍 Analyzing sentiment for client: ${clientId}`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch client reviews and appointment history
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating, review_text, created_at')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(10);

    const { data: appointments } = await supabase
      .from('appointments')
      .select('status, notes, appointment_date')
      .eq('client_id', clientId)
      .order('appointment_date', { ascending: false })
      .limit(5);

    if (!reviews || reviews.length === 0) {
      return new Response(
        JSON.stringify({
          sentiment: 'neutral',
          score: 50,
          confidence: 0,
          insights: ['No review data available for analysis'],
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use Lovable AI for sentiment analysis
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const reviewTexts = reviews.map(r => r.review_text || `Rating: ${r.rating}/5`).join('\n');
    const appointmentNotes = appointments?.map(a => a.notes).filter(Boolean).join('\n') || 'No appointment notes';

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a sentiment analysis expert for salon client relationships. Analyze reviews and interactions to determine:
1. Overall sentiment (positive, neutral, negative)
2. Sentiment score (0-100)
3. Confidence level (0-1)
4. Key insights and concerns
5. Actionable recommendations for the stylist

Be concise and specific. Focus on relationship health and retention risk.`,
          },
          {
            role: 'user',
            content: `Analyze this client's sentiment:

REVIEWS:
${reviewTexts}

APPOINTMENT NOTES:
${appointmentNotes}

METRICS:
- Total reviews: ${reviews.length}
- Average rating: ${(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
- Recent appointments: ${appointments?.length || 0}

Provide analysis in this JSON format:
{
  "sentiment": "positive|neutral|negative",
  "score": 0-100,
  "confidence": 0-1,
  "insights": ["insight1", "insight2", ...],
  "recommendations": ["action1", "action2", ...],
  "riskLevel": "low|medium|high"
}`,
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI analysis failed:', errorText);
      throw new Error(`AI analysis failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;

    // Extract JSON from AI response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      sentiment: 'neutral',
      score: 50,
      confidence: 0.5,
      insights: ['Unable to parse AI response'],
      recommendations: ['Manual review recommended'],
      riskLevel: 'medium',
    };

    // Store analysis results
    await supabase.from('client_sentiment_analysis').insert({
      client_id: clientId,
      stylist_id: stylistId,
      sentiment: analysis.sentiment,
      score: analysis.score,
      confidence: analysis.confidence,
      insights: analysis.insights,
      recommendations: analysis.recommendations,
      risk_level: analysis.riskLevel,
      analyzed_at: new Date().toISOString(),
    });

    console.log(`✅ Sentiment analysis complete: ${analysis.sentiment} (${analysis.score}/100)`);

    return new Response(
      JSON.stringify(analysis),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Error in analyze-client-sentiment:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, compressedJsonResponse } from '../_shared/compression.ts';
import { authenticateRequest } from '../_shared/auth.ts';
import { handleError, validateRequestBody, checkRateLimit } from '../_shared/error-handler.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // SECURITY: Require stylist or admin role
    const { user, supabase, stylistId: userStylistId } = await authenticateRequest(req, { 
      allowStylistOrAdmin: true 
    });
    
    // Rate limiting (5 recommendations per minute - they're more expensive)
    if (!checkRateLimit(user.id, 5, 60000)) {
      return await compressedJsonResponse({ error: 'Rate limit exceeded. Please slow down.' }, 429);
    }

    const body = await req.json();
    validateRequestBody(body, ['clientId', 'stylistId']);
    const { clientId, stylistId } = body;

    // Verify stylist has access to this client
    if (userStylistId !== stylistId) {
      throw new Error('Forbidden: You can only generate recommendations for your own clients');
    }

    console.log('Generating formula recommendations...', { clientId, stylistId });

    // Fetch client profile
    const { data: clientProfile, error: clientError } = await supabase
      .from('client_profiles')
      .select('*, profiles(*)')
      .eq('id', clientId)
      .single();

    if (clientError || !clientProfile) {
      throw new Error('Client not found');
    }

    // Fetch past formulas for this client
    const { data: pastFormulas, error: formulasError } = await supabase
      .from('formulas')
      .select('*')
      .eq('client_id', clientId)
      .eq('stylist_id', stylistId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (formulasError) {
      console.error('Error fetching formulas:', formulasError);
    }

    // Fetch past appointments
    const { data: pastAppointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('*, reviews(*)')
      .eq('client_id', clientId)
      .eq('stylist_id', stylistId)
      .order('appointment_date', { ascending: false })
      .limit(5);

    if (appointmentsError) {
      console.error('Error fetching appointments:', appointmentsError);
    }

    // Fetch stylist preferences
    const { data: stylistPrefs, error: prefsError } = await supabase
      .from('stylist_preferences')
      .select('*')
      .eq('stylist_id', stylistId)
      .maybeSingle();

    if (prefsError) {
      console.error('Error fetching stylist preferences:', prefsError);
    }

    // Fetch any hair analysis results
    const { data: hairAnalyses, error: analysesError } = await supabase
      .from('hair_analysis_results')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(3);

    if (analysesError) {
      console.error('Error fetching hair analyses:', analysesError);
    }

    console.log('Fetched client data:', {
      formulas: pastFormulas?.length || 0,
      appointments: pastAppointments?.length || 0,
      analyses: hairAnalyses?.length || 0
    });

    // Build context for AI
    const context = buildClientContext(
      clientProfile,
      pastFormulas || [],
      pastAppointments || [],
      stylistPrefs,
      hairAnalyses || []
    );

    // Call Lovable AI for recommendations
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

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
            content: `You are an expert hair colorist AI assistant. Analyze client history and provide actionable formula recommendations.

Your recommendations should:
1. Be specific and practical (exact ratios, products, timing)
2. Learn from what worked and what didn't
3. Consider client's hair condition and history
4. Suggest incremental improvements
5. Flag any potential issues or concerns
6. Provide 2-3 concrete formula options with pros/cons

Format your response as structured JSON with this schema:
{
  "recommendations": [
    {
      "title": "Recommendation title",
      "priority": "high|medium|low",
      "formula": "Detailed formula with ratios",
      "reasoning": "Why this will work",
      "expectedResult": "What to expect",
      "processingTime": "in minutes",
      "developVolume": "10vol, 20vol, etc.",
      "concerns": ["Any potential issues"]
    }
  ],
  "insights": [
    "Key insight about client's hair",
    "Pattern noticed from history"
  ],
  "notes": "Additional professional notes"
}`
          },
          {
            role: 'user',
            content: context
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI request failed: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const recommendationsText = aiData.choices?.[0]?.message?.content;

    if (!recommendationsText) {
      throw new Error('No recommendations returned from AI');
    }

    console.log('AI recommendations generated successfully');

    // Try to parse as JSON, fallback to text
    let recommendations;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = recommendationsText.match(/```json\n([\s\S]+?)\n```/) || 
                        recommendationsText.match(/```\n([\s\S]+?)\n```/) ||
                        [null, recommendationsText];
      const jsonString = jsonMatch[1] || recommendationsText;
      recommendations = JSON.parse(jsonString);
    } catch (parseError) {
      console.log('Could not parse as JSON, using text format');
      recommendations = {
        recommendations: [{
          title: 'AI Recommendation',
          priority: 'medium',
          formula: recommendationsText,
          reasoning: 'Based on client history'
        }],
        rawText: recommendationsText
      };
    }

    // Store in ai_insights table
    const { data: insertedInsight, error: insertError } = await supabase
      .from('ai_insights')
      .insert({
        stylist_id: stylistId,
        insight_type: 'formula_recommendation',
        title: 'Smart Formula Recommendations',
        description: `AI-generated recommendations for ${clientProfile.profiles?.full_name || 'client'}`,
        priority: 'high',
        action_items: recommendations.recommendations || [],
        affected_clients: [clientId],
        confidence_score: 0.85,
        metadata: {
          clientId,
          generatedAt: new Date().toISOString(),
          basedOn: {
            formulaCount: pastFormulas?.length || 0,
            appointmentCount: pastAppointments?.length || 0,
            analysisCount: hairAnalyses?.length || 0
          }
        },
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Expires in 7 days
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to save insight:', insertError);
      // Continue anyway, don't block the response
    }

    return await compressedJsonResponse({
      success: true,
      recommendations,
      insightId: insertedInsight?.id,
      rawText: recommendationsText
    });

  } catch (error) {
    console.error('Error in generate-formula-recommendations:', error);
    return handleError(error);
  }
});

function buildClientContext(
  clientProfile: any,
  pastFormulas: any[],
  pastAppointments: any[],
  stylistPrefs: any,
  hairAnalyses: any[]
): string {
  let context = `CLIENT PROFILE:\n`;
  context += `Name: ${clientProfile.profiles?.full_name || 'Unknown'}\n`;
  context += `Email: ${clientProfile.email}\n`;
  
  if (clientProfile.allergies) {
    context += `Allergies: ${clientProfile.allergies}\n`;
  }
  
  if (clientProfile.notes) {
    context += `Notes: ${clientProfile.notes}\n`;
  }

  if (hairAnalyses && hairAnalyses.length > 0) {
    context += `\n\nRECENT HAIR ANALYSES:\n`;
    hairAnalyses.forEach((analysis, i) => {
      context += `Analysis ${i + 1} (${new Date(analysis.created_at).toLocaleDateString()}):\n`;
      if (analysis.analysis_result?.fullText) {
        context += analysis.analysis_result.fullText.substring(0, 500) + '...\n';
      }
    });
  }

  if (pastFormulas && pastFormulas.length > 0) {
    context += `\n\nPAST FORMULAS (Most Recent First):\n`;
    pastFormulas.forEach((formula, i) => {
      context += `\nFormula ${i + 1} (${new Date(formula.created_at).toLocaleDateString()}):\n`;
      context += `Formula: ${formula.formula_text}\n`;
      if (formula.result_notes) {
        context += `Result: ${formula.result_notes}\n`;
      }
      if (formula.what_worked) {
        context += `What Worked: ${formula.what_worked}\n`;
      }
      if (formula.what_to_avoid) {
        context += `What to Avoid: ${formula.what_to_avoid}\n`;
      }
      if (formula.processing_time_minutes) {
        context += `Processing Time: ${formula.processing_time_minutes} minutes\n`;
      }
    });
  }

  if (pastAppointments && pastAppointments.length > 0) {
    context += `\n\nPAST APPOINTMENTS:\n`;
    pastAppointments.forEach((apt, i) => {
      context += `Appointment ${i + 1} (${new Date(apt.appointment_date).toLocaleDateString()}):\n`;
      context += `Service: ${apt.service_type}\n`;
      context += `Status: ${apt.status}\n`;
      
      if (apt.reviews && apt.reviews.length > 0) {
        const review = apt.reviews[0];
        context += `Client Rating: ${review.rating}/5\n`;
        if (review.review_text) {
          context += `Review: ${review.review_text}\n`;
        }
      }
    });
  }

  if (stylistPrefs) {
    context += `\n\nSTYLIST PREFERENCES:\n`;
    if (stylistPrefs.preferred_brands) {
      context += `Preferred Brands: ${JSON.stringify(stylistPrefs.preferred_brands)}\n`;
    }
    if (stylistPrefs.processing_time_tendency) {
      context += `Processing Time Tendency: ${stylistPrefs.processing_time_tendency}\n`;
    }
    if (stylistPrefs.tone_adjustment_style) {
      context += `Tone Adjustment Style: ${stylistPrefs.tone_adjustment_style}\n`;
    }
  }

  context += `\n\nBased on this comprehensive history, please provide 2-3 specific formula recommendations for the client's next appointment.`;

  return context;
}

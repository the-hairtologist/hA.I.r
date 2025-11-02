import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, compressedJsonResponse } from '../_shared/compression.ts';
import { authenticateRequest } from '../_shared/auth.ts';
import { handleError, validateRequestBody } from '../_shared/error-handler.ts';

serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // SECURITY: Require stylist or admin role
    const { user, supabase, stylistId } = await authenticateRequest(req, {
      allowStylistOrAdmin: true,
    });

    if (!stylistId) {
      throw new Error('Stylist profile not found');
    }

    const body = await req.json();
    validateRequestBody(body, ['formulaId', 'outcomeRating']);

    const {
      formulaId,
      conversationMessageId,
      clientId,
      outcomeRating,
      outcomeNotes,
      whatWorked,
      whatDidntWork,
      wouldUseAgain,
    } = body;

    console.log('Recording formula outcome:', { formulaId, outcomeRating });

    // Insert outcome
    const { data: outcome, error } = await supabase
      .from('formula_outcomes')
      .insert({
        formula_id: formulaId,
        conversation_message_id: conversationMessageId,
        stylist_id: stylistId,
        client_id: clientId,
        outcome_rating: outcomeRating,
        outcome_notes: outcomeNotes,
        what_worked: whatWorked,
        what_didnt_work: whatDidntWork,
        would_use_again: wouldUseAgain,
      })
      .select()
      .single();

    if (error) throw error;

    // If formula was successful, add to history for learning
    if (outcomeRating === 'perfect' || outcomeRating === 'good') {
      const { data: formula } = await supabase
        .from('formulas')
        .select('formula_data')
        .eq('id', formulaId)
        .single();

      if (formula) {
        await supabase.from('stylist_formula_history').insert({
          stylist_id: stylistId,
          formula_json: formula.formula_data,
          client_id: clientId,
          outcome_rating: outcomeRating,
        });

        console.log('Added to stylist history for learning');
      }
    }

    // Get success rate for this stylist
    const { data: allOutcomes } = await supabase
      .from('formula_outcomes')
      .select('outcome_rating')
      .eq('stylist_id', stylistId);

    const successRate =
      allOutcomes && allOutcomes.length > 0
        ? parseFloat(
            (
              (allOutcomes.filter(o =>
                ['perfect', 'good'].includes(o.outcome_rating)
              ).length /
                allOutcomes.length) *
              100
            ).toFixed(1)
          )
        : 0;

    return new Response(
      JSON.stringify({
        success: true,
        outcome,
        success_rate: successRate,
        message: 'Thank you for your feedback! This helps improve our AI.',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Track outcome error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

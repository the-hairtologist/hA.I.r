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
    const { formula, clientId } = await req.json();
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing authorization header');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const warnings: string[] = [];
    const blockers: string[] = [];
    let isSafe = true;

    // Validation 1: Developer Volume (10-40 max)
    if (formula.base?.developer) {
      const devVolume = parseInt(formula.base.developer.replace('vol', ''));
      if (devVolume > 40) {
        blockers.push(`Developer volume ${devVolume} exceeds safe maximum (40 vol). Risk of severe damage.`);
        isSafe = false;
      } else if (devVolume > 30) {
        warnings.push(`High developer volume (${devVolume} vol). Monitor processing closely.`);
      }
    }

    // Validation 2: Color-to-Developer Ratio (1:1 to 1:2)
    if (formula.base?.amount && formula.base?.developer_amount) {
      const colorAmount = parseFloat(formula.base.amount);
      const devAmount = parseFloat(formula.base.developer_amount);
      const ratio = devAmount / colorAmount;
      
      if (ratio < 1 || ratio > 2) {
        warnings.push(`Ratio ${ratio.toFixed(2)}:1 is outside recommended range (1:1 to 1:2).`);
      }
    }

    // Validation 3: Processing Time (5-45 minutes)
    if (formula.base?.processing_minutes) {
      const procTime = parseInt(formula.base.processing_minutes);
      if (procTime > 45) {
        blockers.push(`Processing time ${procTime} minutes exceeds safe maximum (45 min). Risk of over-processing.`);
        isSafe = false;
      } else if (procTime < 5) {
        warnings.push(`Processing time ${procTime} minutes is very short. May not achieve desired result.`);
      } else if (procTime > 35) {
        warnings.push(`Extended processing time (${procTime} min). Monitor hair integrity closely.`);
      }
    }

    // Validation 4: Product Compatibility
    const incompatiblePairs = [
      { a: 'bleach', b: 'permanent color', reason: 'Cannot mix bleach with permanent color' },
      { a: 'toner', b: 'high volume developer', reason: 'Toners require low volume developer (10-20 vol)' },
    ];

    for (const pair of incompatiblePairs) {
      const hasA = JSON.stringify(formula).toLowerCase().includes(pair.a);
      const hasB = JSON.stringify(formula).toLowerCase().includes(pair.b);
      if (hasA && hasB) {
        blockers.push(pair.reason);
        isSafe = false;
      }
    }

    // Validation 5: Client Allergy Check
    if (clientId) {
      const { data: client } = await supabase
        .from('client_profiles')
        .select('allergies')
        .eq('id', clientId)
        .single();

      if (client?.allergies) {
        const allergies = client.allergies.toLowerCase();
        const formulaStr = JSON.stringify(formula).toLowerCase();
        
        const commonAllergens = ['ppd', 'ammonia', 'peroxide', 'resorcinol', 'parabens'];
        for (const allergen of commonAllergens) {
          if (allergies.includes(allergen) && formulaStr.includes(allergen)) {
            blockers.push(`⚠️ ALLERGY ALERT: Client is allergic to ${allergen.toUpperCase()}. Do not proceed!`);
            isSafe = false;
          }
        }
      }
    }

    // Validation 6: Multi-Level Lift Warning
    if (formula.base?.current_level && formula.base?.target_level) {
      const currentLevel = parseInt(formula.base.current_level);
      const targetLevel = parseInt(formula.base.target_level);
      const lift = targetLevel - currentLevel;

      if (lift > 3) {
        warnings.push(`Large lift (${lift} levels). Consider multi-session approach for hair integrity.`);
      }
    }

    // Add educational context
    if (warnings.length === 0 && blockers.length === 0) {
      warnings.push('✅ Formula passes all safety checks. Remember to perform strand test.');
    }

    const validationResult = {
      isSafe,
      warnings,
      blockers,
      checkedAt: new Date().toISOString(),
    };

    // Store validation in database
    await supabase.from('formula_validations').insert({
      user_id: user.id,
      formula_content: formula,
      validation_result: validationResult,
      warnings,
      blockers,
      is_safe: isSafe,
    });

    return new Response(
      JSON.stringify(validationResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Formula validation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
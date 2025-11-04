import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

interface ValidationIssue {
  severity: 'blocker' | 'warning' | 'info';
  message: string;
  category: 'safety' | 'completeness' | 'optimization';
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const { formula, formulaText, clientId, clientAllergies } = await req.json();

    // Extract formula text from various possible formats
    let extractedFormulaText = formulaText;
    
    if (!extractedFormulaText && formula) {
      // Handle formula object from QuickFormula or AIAssistant
      if (typeof formula === 'string') {
        extractedFormulaText = formula;
      } else if (formula.text) {
        extractedFormulaText = formula.text;
      } else if (formula.base) {
        // Convert formula object to text
        extractedFormulaText = JSON.stringify(formula.base);
      } else {
        extractedFormulaText = JSON.stringify(formula);
      }
    }

    if (!extractedFormulaText) {
      return new Response(JSON.stringify({ error: 'Formula text required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const issues: ValidationIssue[] = [];

    // Safety checks
    if (clientAllergies && clientAllergies.trim()) {
      const allergies = clientAllergies
        .toLowerCase()
        .split(',')
        .map((a: string) => a.trim());
      const formulaLower = extractedFormulaText.toLowerCase();

      const dangerousIngredients = ['ppd', 'ammonia', 'peroxide', 'bleach'];
      const hasNoAllergyCheck = allergies.some((allergy: string) => {
        const allergyWords = allergy.split(' ');
        return !allergyWords.some((word: string) =>
          formulaLower.includes(word)
        );
      });

      if (hasNoAllergyCheck) {
        issues.push({
          severity: 'blocker',
          message: `⚠️ CRITICAL: Client has documented allergies (${clientAllergies}). Ensure formula addresses these sensitivities.`,
          category: 'safety',
        });
      }

      // Check for dangerous ingredients with known allergies
      dangerousIngredients.forEach(ingredient => {
        if (
          formulaLower.includes(ingredient) &&
          allergies.some((a: string) => a.includes(ingredient))
        ) {
          issues.push({
            severity: 'blocker',
            message: `🚨 DANGER: Formula contains ${ingredient} but client is allergic!`,
            category: 'safety',
          });
        }
      });
    }

    // Completeness checks
    const hasTiming = /\d+\s*(min|minutes|hour|hr|hrs)/i.test(extractedFormulaText);
    const hasRatios =
      /\d+:\d+/.test(extractedFormulaText) || /\d+\s*(oz|ml|g|gram)/i.test(extractedFormulaText);
    const hasSteps = /step\s*\d+|first|second|then|next|finally/i.test(
      extractedFormulaText
    );

    if (!hasTiming) {
      issues.push({
        severity: 'warning',
        message:
          'No processing time specified. Add timing for reproducibility (e.g., "30 minutes").',
        category: 'completeness',
      });
    }

    if (!hasRatios) {
      issues.push({
        severity: 'warning',
        message:
          'No product ratios found. Include measurements for consistent results (e.g., "2:1 ratio" or "30ml").',
        category: 'completeness',
      });
    }

    if (!hasSteps && extractedFormulaText.length < 50) {
      issues.push({
        severity: 'warning',
        message:
          'Formula seems brief. Consider adding step-by-step instructions.',
        category: 'completeness',
      });
    }

    // Optimization suggestions
    if (extractedFormulaText.length > 2000) {
      issues.push({
        severity: 'info',
        message:
          'Formula is quite detailed. Consider breaking into sections for easier reading.',
        category: 'optimization',
      });
    }

    const hasColorTheory = /warm|cool|neutral|ash|golden|red|violet/i.test(
      extractedFormulaText
    );
    if (!hasColorTheory) {
      issues.push({
        severity: 'info',
        message:
          'Consider adding color theory notes (warm/cool tones) for better results.',
        category: 'optimization',
      });
    }

    // Determine overall safety
    const blockers = issues.filter(i => i.severity === 'blocker');
    const warnings = issues.filter(i => i.severity === 'warning');

    // Log validation for analytics
    const { error: logError } = await supabase
      .from('formula_validations')
      .insert({
        user_id: user.id,
        formula_text: extractedFormulaText,
        client_id: clientId,
        is_safe: blockers.length === 0,
        blocker_count: blockers.length,
        warning_count: warnings.length,
        validation_result: { issues },
      });

    if (logError) {
      console.error('Failed to log validation:', logError);
    }

    return new Response(
      JSON.stringify({
        isSafe: blockers.length === 0,
        issues,
        summary: {
          blockers: blockers.length,
          warnings: warnings.length,
          infos: issues.filter(i => i.severity === 'info').length,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Validation error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Validation failed',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

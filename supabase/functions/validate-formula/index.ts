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

    // Server-side rate limiting check
    const RATE_LIMIT_WINDOW = 60; // 60 seconds
    const MAX_REQUESTS = 30; // 30 requests per minute

    const { data: recentRequests, error: rateLimitError } = await supabase
      .from('api_rate_limits')
      .select('request_count, window_start')
      .eq('user_id', user.id)
      .eq('endpoint', 'validate-formula')
      .gte(
        'window_start',
        new Date(Date.now() - RATE_LIMIT_WINDOW * 1000).toISOString()
      )
      .maybeSingle();

    if (rateLimitError && rateLimitError.code !== 'PGRST116') {
      console.error('Rate limit check error:', rateLimitError);
    }

    // Check if rate limit exceeded
    if (recentRequests && recentRequests.request_count >= MAX_REQUESTS) {
      const resetTime = new Date(
        new Date(recentRequests.window_start).getTime() +
          RATE_LIMIT_WINDOW * 1000
      );
      const remainingSeconds = Math.ceil(
        (resetTime.getTime() - Date.now()) / 1000
      );

      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          resetInSeconds: remainingSeconds,
          message: `Too many requests. Please try again in ${remainingSeconds} seconds.`,
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': MAX_REQUESTS.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': remainingSeconds.toString(),
          },
        }
      );
    }

    // Update or insert rate limit record
    const now = new Date().toISOString();
    if (recentRequests) {
      await supabase
        .from('api_rate_limits')
        .update({
          request_count: recentRequests.request_count + 1,
          last_request_at: now,
        })
        .eq('user_id', user.id)
        .eq('endpoint', 'validate-formula');
    } else {
      await supabase.from('api_rate_limits').insert({
        user_id: user.id,
        endpoint: 'validate-formula',
        request_count: 1,
        window_start: now,
        last_request_at: now,
      });
    }

    const remaining = MAX_REQUESTS - (recentRequests?.request_count || 0) - 1;

    const { formulaText, clientId, clientAllergies } = await req.json();

    if (!formulaText) {
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
      const formulaLower = formulaText.toLowerCase();

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
    const hasTiming = /\d+\s*(min|minutes|hour|hr|hrs)/i.test(formulaText);
    const hasRatios =
      /\d+:\d+/.test(formulaText) || /\d+\s*(oz|ml|g|gram)/i.test(formulaText);
    const hasSteps = /step\s*\d+|first|second|then|next|finally/i.test(
      formulaText
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

    if (!hasSteps && formulaText.length < 50) {
      issues.push({
        severity: 'warning',
        message:
          'Formula seems brief. Consider adding step-by-step instructions.',
        category: 'completeness',
      });
    }

    // Optimization suggestions
    if (formulaText.length > 2000) {
      issues.push({
        severity: 'info',
        message:
          'Formula is quite detailed. Consider breaking into sections for easier reading.',
        category: 'optimization',
      });
    }

    const hasColorTheory = /warm|cool|neutral|ash|golden|red|violet/i.test(
      formulaText
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
        formula_text: formulaText,
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

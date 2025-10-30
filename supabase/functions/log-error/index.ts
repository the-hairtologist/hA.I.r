import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

interface ErrorLog {
  message: string;
  stack?: string;
  level: 'error' | 'warning' | 'info';
  context?: Record<string, any>;
  userId?: string;
}

serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const errorData: ErrorLog = await req.json();

    // Log to database
    const { error } = await supabase.from('error_logs').insert({
      user_id: errorData.userId || null,
      error_message: errorData.message,
      error_stack: errorData.stack || null,
      error_level: errorData.level,
      context: errorData.context || {},
      user_agent: req.headers.get('user-agent'),
      ip_address: req.headers.get('x-forwarded-for'),
    });

    if (error) {
      console.error('Failed to log error:', error);
      throw error;
    }

    // Also send to Sentry if configured (for critical errors)
    if (errorData.level === 'error' && Deno.env.get('SENTRY_DSN')) {
      try {
        // Could integrate with Sentry here for redundancy
        console.log('Error logged to database and would be sent to Sentry');
      } catch (sentryError) {
        console.error('Failed to send to Sentry:', sentryError);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in log-error function:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

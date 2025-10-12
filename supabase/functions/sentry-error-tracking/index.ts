import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ErrorEvent {
  message: string;
  stack?: string;
  level: 'error' | 'warning' | 'info';
  context?: Record<string, any>;
  userId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const errorEvent: ErrorEvent = await req.json();
    
    // Log error to console for debugging
    console.error('[Error Tracking]', {
      message: errorEvent.message,
      level: errorEvent.level,
      userId: errorEvent.userId,
      context: errorEvent.context,
      timestamp: new Date().toISOString(),
    });

    // In production, you would send this to Sentry or another error tracking service
    // For now, we'll just acknowledge receipt
    
    return new Response(
      JSON.stringify({ 
        success: true,
        logged: true,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error: any) {
    console.error('Error in error-tracking function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to log error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

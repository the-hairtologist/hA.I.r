/**
 * Rate Limiting Middleware
 * Protects expensive operations (especially AI features)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface RateLimitConfig {
  requests: number;
  windowMs: number;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  'ai_chat': { requests: 30, windowMs: 3600000 }, // 30/hour
  'ai_insights': { requests: 10, windowMs: 3600000 }, // 10/hour
  'ai_scheduling': { requests: 20, windowMs: 3600000 }, // 20/hour
  'default': { requests: 100, windowMs: 3600000 }, // 100/hour
};

export async function checkRateLimit(
  userId: string,
  endpoint: string,
  supabase: any
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const config = RATE_LIMITS[endpoint] || RATE_LIMITS.default;
  const windowStart = new Date(Date.now() - config.windowMs);

  // Count requests in current window
  const { data: rateLimits, error } = await supabase
    .from('api_rate_limits')
    .select('request_count')
    .eq('user_id', userId)
    .eq('endpoint', endpoint)
    .gte('window_start', windowStart.toISOString())
    .order('window_start', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Rate limit check error:', error);
    // Fail open (allow request) on error to avoid blocking users
    return { 
      allowed: true, 
      remaining: config.requests, 
      resetAt: new Date(Date.now() + config.windowMs) 
    };
  }

  const currentCount = rateLimits?.request_count || 0;
  const allowed = currentCount < config.requests;
  const remaining = Math.max(0, config.requests - currentCount - 1);

  if (allowed) {
    // Increment counter
    if (rateLimits) {
      await supabase
        .from('api_rate_limits')
        .update({ 
          request_count: currentCount + 1 
        })
        .eq('user_id', userId)
        .eq('endpoint', endpoint)
        .gte('window_start', windowStart.toISOString());
    } else {
      await supabase
        .from('api_rate_limits')
        .insert({
          user_id: userId,
          endpoint: endpoint,
          request_count: 1,
          window_start: new Date().toISOString()
        });
    }
  }

  return {
    allowed,
    remaining,
    resetAt: new Date(Date.now() + config.windowMs)
  };
}

export function createRateLimitResponse(resetAt: Date): Response {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  return new Response(
    JSON.stringify({ 
      error: 'Rate limit exceeded',
      resetAt: resetAt.toISOString(),
      message: 'Too many requests. Please try again later.'
    }),
    { 
      status: 429, 
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Retry-After': Math.ceil((resetAt.getTime() - Date.now()) / 1000).toString()
      } 
    }
  );
}

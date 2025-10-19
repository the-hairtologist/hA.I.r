/**
 * Server-Side Rate Limiter for Edge Functions
 * Protects against abuse and DDoS attacks
 */

interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store (consider using Redis/Upstash for production)
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
  REMINDERS: { maxRequests: 100, windowSeconds: 60 }, // 100 per minute
  AI_GENERATION: { maxRequests: 20, windowSeconds: 60 }, // 20 per minute
  SMS_NOTIFICATION: { maxRequests: 10, windowSeconds: 60 }, // 10 per minute
  EMAIL_SEND: { maxRequests: 50, windowSeconds: 60 }, // 50 per minute
  WEBHOOK: { maxRequests: 100, windowSeconds: 60 }, // 100 per minute
  DEFAULT: { maxRequests: 60, windowSeconds: 60 }, // 60 per minute
} as const;

/**
 * Check if request is rate limited
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = RATE_LIMITS.DEFAULT
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const key = `ratelimit:${identifier}`;
  
  // Get or create entry
  let entry = rateLimitStore.get(key);
  
  // Reset if window expired
  if (!entry || now >= entry.resetAt) {
    entry = {
      count: 0,
      resetAt: now + config.windowSeconds * 1000,
    };
    rateLimitStore.set(key, entry);
  }
  
  // Check limit
  const allowed = entry.count < config.maxRequests;
  
  if (allowed) {
    entry.count++;
  }
  
  return {
    allowed,
    remaining: Math.max(0, config.maxRequests - entry.count),
    resetAt: entry.resetAt,
  };
}

/**
 * Clean up expired entries (call periodically)
 */
export function cleanupRateLimits() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now >= entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(
  remaining: number,
  resetAt: number,
  maxRequests: number
): Record<string, string> {
  return {
    'X-RateLimit-Limit': maxRequests.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': Math.floor(resetAt / 1000).toString(),
  };
}

/**
 * Create rate limit error response
 */
export function rateLimitErrorResponse(resetAt: number): Response {
  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
  
  return new Response(
    JSON.stringify({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
      },
    }
  );
}

// Cleanup every 5 minutes
setInterval(cleanupRateLimits, 5 * 60 * 1000);

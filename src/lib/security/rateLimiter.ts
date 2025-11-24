/**
 * Client-Side Rate Limiter
 * Prevents abuse by limiting request frequency
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

class ClientRateLimiter {
  private requests: Map<string, number[]> = new Map();

  /**
   * Check if a request is allowed
   */
  isAllowed(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];

    // Remove old requests outside the time window
    const validRequests = requests.filter(
      timestamp => now - timestamp < config.windowMs
    );

    if (validRequests.length >= config.maxRequests) {
      return false;
    }

    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }

  /**
   * Get remaining requests in current window
   */
  getRemaining(key: string, config: RateLimitConfig): number {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    const validRequests = requests.filter(
      timestamp => now - timestamp < config.windowMs
    );
    return Math.max(0, config.maxRequests - validRequests.length);
  }

  /**
   * Get time until next request is allowed
   */
  getRetryAfter(key: string, config: RateLimitConfig): number {
    const requests = this.requests.get(key) || [];
    if (requests.length === 0) return 0;

    const oldestRequest = Math.min(...requests);
    const resetTime = oldestRequest + config.windowMs;
    return Math.max(0, resetTime - Date.now());
  }

  /**
   * Clear rate limit for a key
   */
  clear(key: string): void {
    this.requests.delete(key);
  }
}

export const rateLimiter = new ClientRateLimiter();

/**
 * Common rate limit configurations
 */
export const RATE_LIMITS = {
  // API calls: 60 requests per minute
  API: { maxRequests: 60, windowMs: 60 * 1000 },

  // Form submissions: 5 per minute
  FORM: { maxRequests: 5, windowMs: 60 * 1000 },

  // Search: 30 per minute
  SEARCH: { maxRequests: 30, windowMs: 60 * 1000 },

  // File uploads: 10 per 5 minutes
  UPLOAD: { maxRequests: 10, windowMs: 5 * 60 * 1000 },

  // AI requests: 20 per minute
  AI: { maxRequests: 20, windowMs: 60 * 1000 },
} as const;

/**
 * Client-Side Rate Limit Detection & User Feedback
 * Provides user-friendly warnings when approaching or hitting rate limits
 */

import { safeConsole } from '@/lib/safeLogger';

interface RateLimitState {
  remainingRequests: number;
  resetTime: number;
  isLimited: boolean;
}

const RATE_LIMIT_STORAGE_KEY = 'ai_rate_limit_state';
const WARNING_THRESHOLD = 5; // Show warning when less than 5 requests remain

export class RateLimitManager {
  private static getState(): RateLimitState | null {
    try {
      const stored = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private static setState(state: RateLimitState): void {
    try {
      localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      safeConsole.warn('Failed to store rate limit state:', error);
    }
  }

  /**
   * Check if user is currently rate limited
   */
  static isRateLimited(): boolean {
    const state = this.getState();
    if (!state) return false;

    if (state.isLimited && Date.now() < state.resetTime) {
      return true;
    }

    // Reset if time has passed
    if (Date.now() >= state.resetTime) {
      this.clearLimit();
      return false;
    }

    return false;
  }

  /**
   * Get remaining time until rate limit resets (in seconds)
   */
  static getRemainingTime(): number {
    const state = this.getState();
    if (!state || !state.isLimited) return 0;

    const remaining = Math.max(0, Math.floor((state.resetTime - Date.now()) / 1000));
    return remaining;
  }

  /**
   * Record a rate limit hit from API response
   */
  static recordLimit(resetInSeconds: number = 60): void {
    this.setState({
      remainingRequests: 0,
      resetTime: Date.now() + (resetInSeconds * 1000),
      isLimited: true
    });
  }

  /**
   * Track successful request and check if approaching limit
   */
  static recordRequest(remaining?: number): { shouldWarn: boolean; message?: string } {
    if (remaining === undefined) {
      return { shouldWarn: false };
    }

    this.setState({
      remainingRequests: remaining,
      resetTime: Date.now() + 60000, // Assume 1-minute window
      isLimited: false
    });

    if (remaining <= WARNING_THRESHOLD) {
      return {
        shouldWarn: true,
        message: `⚠️ ${remaining} AI requests remaining. Rate limit resets in 1 minute.`
      };
    }

    return { shouldWarn: false };
  }

  /**
   * Clear rate limit state
   */
  static clearLimit(): void {
    localStorage.removeItem(RATE_LIMIT_STORAGE_KEY);
  }

  /**
   * Get user-friendly error message for rate limit
   */
  static getUserMessage(): string {
    const remaining = this.getRemainingTime();
    if (remaining > 0) {
      return `⏳ Rate limit reached. Please wait ${remaining} seconds before trying again.`;
    }
    return '⏳ Rate limit reached. Please try again in a moment.';
  }

  /**
   * Check response for rate limit headers
   */
  static checkResponse(response: Response): void {
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const reset = response.headers.get('X-RateLimit-Reset');

    if (response.status === 429) {
      const resetSeconds = reset ? parseInt(reset) : 60;
      this.recordLimit(resetSeconds);
    } else if (remaining) {
      this.recordRequest(parseInt(remaining));
    }
  }
}

/**
 * Hook into fetch to automatically track rate limits
 */
export function setupRateLimitTracking() {
  if (typeof window === 'undefined') return;

  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const response = await originalFetch(...args);
    
    // Only track Supabase function calls
    if (args[0]?.toString().includes('functions/v1')) {
      RateLimitManager.checkResponse(response.clone());
    }
    
    return response;
  };
}

/**
 * Utility to show rate limit toast
 */
export function showRateLimitToast(toast: any) {
  if (RateLimitManager.isRateLimited()) {
    toast.error(RateLimitManager.getUserMessage(), {
      duration: 5000,
      description: "AI features are temporarily paused. This helps ensure fair usage for all users."
    });
    return true;
  }
  return false;
}
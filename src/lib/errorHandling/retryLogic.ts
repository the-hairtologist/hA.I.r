/**
 * Retry Logic with Exponential Backoff
 * Automatically retries failed operations with intelligent backoff
 */

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableErrors?: (error: any) => boolean;
  onRetry?: (attempt: number, error: any) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  retryableErrors: (error: any) => {
    // Retry on network errors and 5xx errors
    if (error?.message?.includes('network')) return true;
    if (error?.message?.includes('fetch')) return true;
    if (error?.status >= 500 && error?.status < 600) return true;
    if (error?.status === 429) return true; // Rate limit
    return false;
  },
  onRetry: () => {},
};

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(
  attempt: number,
  baseDelay: number,
  maxDelay: number,
  multiplier: number
): number {
  const exponentialDelay = baseDelay * Math.pow(multiplier, attempt);
  const jitter = Math.random() * 0.3 * exponentialDelay; // Add 0-30% jitter
  return Math.min(exponentialDelay + jitter, maxDelay);
}

/**
 * Retry an async operation with exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Don't retry if error is not retryable
      if (!config.retryableErrors(error)) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === config.maxRetries) {
        throw error;
      }

      // Calculate delay and wait
      const delay = calculateDelay(
        attempt,
        config.baseDelay,
        config.maxDelay,
        config.backoffMultiplier
      );

      config.onRetry(attempt + 1, error);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Create a retry wrapper for a function
 */
export function createRetryWrapper<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: RetryOptions = {}
): T {
  return ((...args: any[]) => withRetry(() => fn(...args), options)) as T;
}

/**
 * Batch retry - retry multiple operations with shared retry logic
 */
export async function batchRetry<T>(
  operations: Array<() => Promise<T>>,
  options: RetryOptions = {}
): Promise<Array<{ success: boolean; data?: T; error?: any }>> {
  return Promise.all(
    operations.map(async op => {
      try {
        const data = await withRetry(op, options);
        return { success: true, data };
      } catch (error) {
        return { success: false, error };
      }
    })
  );
}

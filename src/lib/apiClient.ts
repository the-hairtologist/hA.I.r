/**
 * API Client with Automatic Retry Logic
 * Wraps Supabase client with enhanced error handling
 */

import { supabase } from '@/integrations/supabase/client';
import { withRetry } from './errorHandler';
import { toast } from 'sonner';
import { log } from './logger';

interface RetryConfig {
  maxRetries?: number;
  showToast?: boolean;
}

/**
 * Wrap a Supabase query with automatic retry logic for network errors
 */
export async function withQueryRetry<T>(
  queryFn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const { maxRetries = 3, showToast = true } = config;

  return withRetry(queryFn, {
    maxRetries,
    delay: 1000,
    backoff: true,
    onRetry: attempt => {
      log.warn(
        `Retrying API call (attempt ${attempt}/${maxRetries})`,
        'apiClient'
      );
      if (showToast) {
        toast.info(`Retrying... (Attempt ${attempt}/${maxRetries})`);
      }
    },
  });
}

/**
 * Enhanced Supabase client wrapper with retry logic
 */
export const apiClient = {
  /**
   * Execute a Supabase query with automatic retry on network errors
   */
  async query<T>(
    queryFn: () => Promise<{ data: T | null; error: any }>,
    config?: RetryConfig
  ) {
    try {
      const result = await withQueryRetry(queryFn, config);

      if (result.error) {
        // Don't retry on non-network errors (auth, validation, etc.)
        throw result.error;
      }

      return result;
    } catch (error) {
      log.error('API query failed', 'apiClient', error as Error);
      throw error;
    }
  },

  /**
   * Execute multiple queries in parallel with retry logic
   */
  async parallel<T extends any[]>(
    queries: Array<() => Promise<any>>,
    config?: RetryConfig
  ): Promise<T> {
    const results = await Promise.all(
      queries.map(query => withQueryRetry(query, config))
    );
    return results as T;
  },
};

export default apiClient;

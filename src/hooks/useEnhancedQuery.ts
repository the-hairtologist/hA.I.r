/**
 * Enhanced Query Hook with Retry Logic and Caching
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { withRetry, RetryOptions } from '@/lib/errorHandling/retryLogic';
import { queryCache, createCacheKey } from '@/lib/database/queryOptimization';
import { offlineQueue } from '@/lib/errorHandling/offlineQueue';
import { logger } from '@/lib/logger';

interface EnhancedQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryFn'> {
  queryFn: () => Promise<T>;
  retryOptions?: RetryOptions;
  cacheTable?: string;
  cacheParams?: Record<string, any>;
  offlineSupport?: boolean;
}

/**
 * Enhanced useQuery with automatic retry, caching, and offline support
 */
export function useEnhancedQuery<T>(options: EnhancedQueryOptions<T>) {
  const {
    queryFn,
    retryOptions,
    cacheTable,
    cacheParams,
    offlineSupport = false,
    ...queryOptions
  } = options;

  // Create cache key if caching is enabled
  const cacheKey = cacheTable && cacheParams 
    ? createCacheKey(cacheTable, cacheParams)
    : null;

  const enhancedQueryFn = async (): Promise<T> => {
    // Check cache first
    if (cacheKey) {
      const cached = queryCache.get<T>(cacheKey);
      if (cached !== null) {
        logger.debug('Using cached query result', 'useEnhancedQuery', { cacheKey });
        return cached;
      }
    }

    // Execute query with retry logic
    try {
      const data = await withRetry(queryFn, {
        ...retryOptions,
        onRetry: (attempt, error) => {
          logger.warn('Retrying query', 'useEnhancedQuery', {
            attempt,
            error: error?.message,
          });
          retryOptions?.onRetry?.(attempt, error);
        },
      });

      // Cache successful result
      if (cacheKey && data) {
        queryCache.set(cacheKey, data);
      }

      return data;
    } catch (error) {
      // Queue for offline processing if enabled
      if (offlineSupport && !navigator.onLine) {
        logger.info('Queuing query for offline processing', 'useEnhancedQuery');
        offlineQueue.enqueue(queryFn);
      }
      throw error;
    }
  };

  return useQuery({
    ...queryOptions,
    queryFn: enhancedQueryFn,
    // Disable React Query's built-in retry since we handle it ourselves
    retry: false,
  });
}

/**
 * Invalidate query cache
 */
export function invalidateQueryCache(table: string, params?: Record<string, any>) {
  if (params) {
    const key = createCacheKey(table, params);
    queryCache.invalidate(key);
  } else {
    queryCache.invalidatePattern(table);
  }
}

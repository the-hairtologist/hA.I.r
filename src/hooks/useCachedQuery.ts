/**
 * Cached Query Hook
 * Combines React Query with cache management for optimal performance
 */

import { useQuery, UseQueryOptions, QueryKey } from '@tanstack/react-query';
import { cacheManager, CACHE_STRATEGIES } from '@/lib/cache/CacheManager';
import { logger } from '@/lib/logger';

interface CachedQueryOptions<TData> extends Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'> {
  queryKey: QueryKey;
  queryFn: () => Promise<TData>;
  cacheType: keyof typeof CACHE_STRATEGIES;
}

/**
 * Enhanced useQuery with automatic cache management
 * 
 * Features:
 * - Automatic TTL based on data type
 * - Integrated with cache manager
 * - Request deduplication via React Query
 * - Smart refetching strategies
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useCachedQuery({
 *   queryKey: ['clients', stylistId],
 *   queryFn: () => getClientsByStylist(stylistId),
 *   cacheType: 'clients',
 * });
 * ```
 */
export function useCachedQuery<TData>({
  queryKey,
  queryFn,
  cacheType,
  ...options
}: CachedQueryOptions<TData>) {
  const strategy = cacheManager.getStrategy(cacheType);

  const query = useQuery<TData>({
    queryKey,
    queryFn: async () => {
      logger.debug(`Fetching: ${cacheType}`, 'useCachedQuery', { queryKey });
      return queryFn();
    },
    staleTime: strategy.ttl,
    gcTime: strategy.ttl * 2, // Keep in cache 2x longer than stale time
    refetchOnWindowFocus: strategy.revalidateOnFocus ?? false,
    refetchOnMount: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    ...options,
  });

  return query;
}

/**
 * Helper to invalidate cache for a specific type
 */
export function useInvalidateCache() {
  return {
    invalidate: (type: keyof typeof CACHE_STRATEGIES, identifier?: string) => {
      cacheManager.invalidate(type, identifier);
    },
    invalidateAfterMutation: (
      mutationType: 'appointment' | 'client' | 'payment' | 'service' | 'message',
      stylistId: string
    ) => {
      cacheManager.invalidateAfterMutation(mutationType, stylistId);
    },
    clearAll: () => {
      cacheManager.clearAll();
    },
  };
}

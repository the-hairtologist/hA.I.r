/**
 * Smart Query Hook with AI-powered caching
 * Automatically learns patterns and optimizes data fetching
 */

import { useState, useEffect } from 'react';
import { queryCache } from '@/lib/data/QueryCache';
import { smartCacheAI } from '@/lib/ai/SmartCacheAI';

interface UseSmartQueryOptions<T> {
  key: string;
  fetcher: () => Promise<T>;
  ttl?: number;
  enabled?: boolean;
}

export function useSmartQuery<T>({
  key,
  fetcher,
  ttl = 5 * 60 * 1000, // 5 minutes default
  enabled = true,
}: UseSmartQueryOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Track access for AI learning
        smartCacheAI.trackAccess(key);

        // Fetch with cache
        const result = await queryCache.fetch(key, fetcher, ttl);
        
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
          setData(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [key, enabled]);

  const refetch = async () => {
    queryCache.invalidate(key);
    setIsLoading(true);
    
    try {
      const result = await queryCache.fetch(key, fetcher, ttl);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err as Error);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    data,
    error,
    isLoading,
    refetch,
  };
}

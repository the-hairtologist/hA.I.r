/**
 * Database Query Optimization Utilities
 * Helpers for efficient database queries and caching
 */

import { logger } from '@/lib/logger';

/**
 * Pagination helper with consistent defaults
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginationResult<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export function createPaginationParams(
  params: PaginationParams = {}
): Required<PaginationParams> {
  return {
    page: params.page || 1,
    pageSize: Math.min(params.pageSize || 50, 100), // Max 100 items per page
  };
}

export function calculatePaginationRange(params: Required<PaginationParams>): {
  from: number;
  to: number;
} {
  const from = (params.page - 1) * params.pageSize;
  const to = from + params.pageSize - 1;
  return { from, to };
}

/**
 * Query cache for reducing redundant database calls
 */
class QueryCache {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });

    // Auto-cleanup old entries
    this.cleanup();
  }

  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }

    const age = Date.now() - cached.timestamp;
    if (age > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    logger.debug('Query cache hit', 'QueryCache', { key, age });
    return cached.data as T;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
    logger.debug('Query cache invalidated', 'QueryCache', { key });
  }

  invalidatePattern(pattern: string): void {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        count++;
      }
    }
    logger.debug('Query cache pattern invalidated', 'QueryCache', {
      pattern,
      count,
    });
  }

  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    logger.info('Query cache cleared', 'QueryCache', { size });
  }

  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, cached] of this.cache.entries()) {
      const age = now - cached.timestamp;
      if (age > cached.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug('Query cache cleaned up', 'QueryCache', {
        cleaned,
        remaining: this.cache.size,
      });
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const queryCache = new QueryCache();

/**
 * Create cache key from query params
 */
export function createCacheKey(
  table: string,
  params: Record<string, any>
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}:${JSON.stringify(params[key])}`)
    .join('|');
  return `${table}|${sortedParams}`;
}

/**
 * Batch query helper - fetches multiple IDs in a single query
 */
export async function batchFetch<T>(
  fetchFn: (ids: string[]) => Promise<T[]>,
  ids: string[],
  batchSize: number = 50
): Promise<T[]> {
  const results: T[] = [];
  
  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);
    const batchResults = await fetchFn(batch);
    results.push(...batchResults);
  }

  return results;
}

/**
 * Recommended database indexes for common queries
 */
export const RECOMMENDED_INDEXES = {
  appointments: [
    { columns: ['stylist_id', 'appointment_date'], desc: 'Stylist calendar view' },
    { columns: ['client_id', 'appointment_date'], desc: 'Client history' },
    { columns: ['status', 'appointment_date'], desc: 'Status filtering' },
    { columns: ['reminder_sent', 'appointment_date'], desc: 'Reminder scheduling' },
  ],
  client_profiles: [
    { columns: ['user_id'], desc: 'User lookup' },
    { columns: ['preferred_stylist_id'], desc: 'Stylist client list' },
    { columns: ['email'], desc: 'Email lookup' },
  ],
  formulas: [
    { columns: ['stylist_id', 'created_at'], desc: 'Stylist formula history' },
    { columns: ['client_id', 'created_at'], desc: 'Client formula history' },
  ],
} as const;

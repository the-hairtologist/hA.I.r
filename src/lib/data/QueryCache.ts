/**
 * Simple Query Cache
 * 
 * Prevents duplicate queries when multiple components need the same data.
 * Uses in-memory cache with TTL (time-to-live) for automatic invalidation.
 * 
 * Features:
 * - Request deduplication
 * - TTL-based invalidation
 * - Manual invalidation by key
 * - TypeScript generics for type safety
 */

import { logger } from '../logger';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class QueryCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private pendingRequests: Map<string, Promise<unknown>> = new Map();

  /**
   * Get data from cache or fetch it
   */
  async fetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 5 * 60 * 1000 // 5 minutes default
  ): Promise<T> {
    // Check cache first
    const cached = this.get<T>(key);
    if (cached !== null) {
      logger.debug('Cache hit', 'queryCache', { key });
      return cached;
    }

    // Check if there's already a pending request for this key
    if (this.pendingRequests.has(key)) {
      logger.debug('Deduplicating request', 'queryCache', { key });
      return this.pendingRequests.get(key)!;
    }

    // Fetch data
    logger.debug('Cache miss, fetching', 'queryCache', { key });
    const promise = fetcher();
    this.pendingRequests.set(key, promise);

    try {
      const data = await promise;
      this.set(key, data, ttl);
      return data;
    } finally {
      this.pendingRequests.delete(key);
    }
  }

  /**
   * Get data from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      logger.debug('Cache entry expired', 'queryCache', { key });
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set data in cache
   */
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Invalidate specific key
   */
  invalidate(key: string): void {
    logger.debug('Invalidating cache key', 'queryCache', { key });
    this.cache.delete(key);
  }

  /**
   * Invalidate keys matching a pattern
   */
  invalidatePattern(pattern: RegExp): void {
    const keysToDelete: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => {
      logger.debug('Invalidating cache key (pattern match)', 'queryCache', { key });
      this.cache.delete(key);
    });
  }

  /**
   * Clear all cache
   */
  clear(): void {
    logger.debug('Clearing all cache', 'queryCache');
    this.cache.clear();
    this.pendingRequests.clear();
  }

  /**
   * Get cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      pendingRequests: this.pendingRequests.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Singleton instance
export const queryCache = new QueryCache();

// Helper to generate cache keys
export const cacheKeys = {
  stylistProfile: (userId: string) => `stylist-profile:${userId}`,
  clientProfile: (userId: string) => `client-profile:${userId}`,
  appointments: (stylistId: string, filters?: string) => 
    `appointments:${stylistId}${filters ? `:${filters}` : ''}`,
  clients: (stylistId: string) => `clients:${stylistId}`,
  formulas: (stylistId: string, clientId?: string) =>
    `formulas:${stylistId}${clientId ? `:${clientId}` : ''}`,
  messages: (userId: string) => `messages:${userId}`,
};

/**
 * Centralized Cache Manager
 * Coordinates all caching strategies across the app
 */

import { queryCache } from '@/lib/data/QueryCache';
import { requestDeduplicator } from '@/lib/api/requestDeduplicator';
import { logger } from '@/lib/logger';

interface CacheStrategy {
  ttl: number;
  priority: 'high' | 'medium' | 'low';
  revalidateOnFocus?: boolean;
}

// Cache strategies per data type
const CACHE_STRATEGIES: Record<string, CacheStrategy> = {
  // User data - short TTL, high priority
  profile: { ttl: 2 * 60 * 1000, priority: 'high' }, // 2 min

  // Appointments - medium TTL
  appointments: { ttl: 5 * 60 * 1000, priority: 'high' }, // 5 min
  upcomingAppointments: { ttl: 1 * 60 * 1000, priority: 'high' }, // 1 min

  // Client data - medium TTL
  clients: { ttl: 10 * 60 * 1000, priority: 'medium' }, // 10 min
  clientDetails: { ttl: 5 * 60 * 1000, priority: 'medium' }, // 5 min

  // Financial data - shorter TTL
  payments: { ttl: 3 * 60 * 1000, priority: 'high' }, // 3 min
  commissions: { ttl: 3 * 60 * 1000, priority: 'high' }, // 3 min

  // Service catalog - longer TTL (rarely changes)
  services: { ttl: 30 * 60 * 1000, priority: 'low' }, // 30 min

  // Messages - short TTL
  messages: { ttl: 30 * 1000, priority: 'high' }, // 30 sec
  unreadCount: { ttl: 15 * 1000, priority: 'high' }, // 15 sec

  // Analytics - longer TTL
  analytics: { ttl: 15 * 60 * 1000, priority: 'low' }, // 15 min
  insights: { ttl: 15 * 60 * 1000, priority: 'low' }, // 15 min

  // Formulas - medium TTL
  formulas: { ttl: 10 * 60 * 1000, priority: 'medium' }, // 10 min
  formulaDetails: { ttl: 5 * 60 * 1000, priority: 'medium' }, // 5 min
};

class CacheManager {
  /**
   * Get cache strategy for a data type
   */
  getStrategy(type: keyof typeof CACHE_STRATEGIES): CacheStrategy {
    return CACHE_STRATEGIES[type] || { ttl: 5 * 60 * 1000, priority: 'medium' };
  }

  /**
   * Invalidate cache by data type
   */
  invalidate(type: keyof typeof CACHE_STRATEGIES, identifier?: string): void {
    logger.info(`Invalidating cache: ${type}`, 'CacheManager', { identifier });

    // Invalidate query cache
    if (identifier) {
      queryCache.invalidate(`${type}:${identifier}`);
    } else {
      queryCache.invalidatePattern(new RegExp(`^${type}:`));
    }
  }

  /**
   * Invalidate multiple related caches
   */
  invalidateRelated(
    types: Array<keyof typeof CACHE_STRATEGIES>,
    identifier?: string
  ): void {
    types.forEach(type => this.invalidate(type, identifier));
  }

  /**
   * Smart cache invalidation after mutations
   */
  invalidateAfterMutation(
    mutationType:
      | 'appointment'
      | 'client'
      | 'payment'
      | 'service'
      | 'message'
      | 'formula',
    stylistId: string
  ): void {
    logger.info(`Invalidating after ${mutationType} mutation`, 'CacheManager', {
      stylistId,
    });

    switch (mutationType) {
      case 'appointment':
        this.invalidateRelated(
          ['appointments', 'upcomingAppointments', 'analytics'],
          stylistId
        );
        break;
      case 'client':
        this.invalidateRelated(
          ['clients', 'clientDetails', 'analytics'],
          stylistId
        );
        break;
      case 'payment':
        this.invalidateRelated(
          ['payments', 'commissions', 'analytics'],
          stylistId
        );
        break;
      case 'service':
        this.invalidate('services', stylistId);
        break;
      case 'message':
        this.invalidateRelated(['messages', 'unreadCount'], stylistId);
        break;
      case 'formula':
        this.invalidateRelated(['formulas', 'formulaDetails'], stylistId);
        break;
    }
  }

  /**
   * Clear all caches (for logout or major state changes)
   */
  clearAll(): void {
    logger.info('Clearing all caches', 'CacheManager');
    queryCache.clear();
    requestDeduplicator.clearAll();
  }

  /**
   * Get cache health metrics
   */
  getHealthMetrics() {
    const stats = queryCache.getStats();
    const dedupeCount = requestDeduplicator.getPendingCount();

    return {
      cacheSize: stats.size,
      pendingRequests: stats.pendingRequests,
      deduplicationActive: dedupeCount,
      health:
        stats.size < 100 ? 'healthy' : stats.size < 500 ? 'moderate' : 'high',
    };
  }

  /**
   * Optimize cache (remove stale entries)
   */
  optimize(): void {
    logger.info('Optimizing cache', 'CacheManager');

    const stats = queryCache.getStats();
    const beforeSize = stats.size;

    // Query cache auto-expires entries, so just log
    logger.info('Cache optimization complete', 'CacheManager', {
      entriesChecked: beforeSize,
      currentSize: stats.size,
    });
  }

  /**
   * Preload critical data
   */
  async preloadCritical(
    stylistId: string,
    dataTypes: Array<keyof typeof CACHE_STRATEGIES> = []
  ): Promise<void> {
    logger.info('Preloading critical cache', 'CacheManager', {
      stylistId,
      types: dataTypes,
    });

    // This would be called with actual data fetchers in real usage
    // For now, it's a placeholder for the pattern
  }
}

export const cacheManager = new CacheManager();

// Export cache strategies for use in queries
export { CACHE_STRATEGIES };

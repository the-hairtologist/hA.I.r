/**
 * Unified Cache Manager
 * Integrates and manages all application cache systems
 */

import { queryCache } from '@/lib/data/QueryCache';
import { queryClient } from '@/lib/queryCache';
import { prefetchManager } from '@/utils/prefetch';
import { logger } from '@/lib/logger';

interface CacheStats {
  queryCache: number;
  reactQuery: number;
  prefetch: number;
  total: number;
}

class CacheOptimizerSystem {
  private readonly MAX_CACHE_SIZE = 1000;
  private readonly MAX_AGE_MS = 10 * 60 * 1000; // 10 minutes

  /**
   * Optimize all application caches
   */
  async optimize(): Promise<{ cleaned: number; retained: number }> {
    logger.info('Starting unified cache optimization', 'CacheOptimizer');

    const beforeStats = this.getStats();
    const beforeTotal = beforeStats.total;
    
    // Clear old entries from all cache systems
    this.clearOldEntries();
    
    const afterStats = this.getStats();
    const afterTotal = afterStats.total;
    const cleaned = beforeTotal - afterTotal;

    logger.info('Cache optimization complete', 'CacheOptimizer', {
      cleaned,
      retained: afterTotal,
      queryCache: afterStats.queryCache,
      reactQuery: afterStats.reactQuery,
      total: afterStats.total
    });

    return { cleaned, retained: afterTotal };
  }

  /**
   * Clear old cache entries from all systems
   */
  private clearOldEntries(): void {
    const stats = this.getStats();
    
    // Only clear if total cache is getting large
    if (stats.total > this.MAX_CACHE_SIZE * 0.8) {
      logger.debug('Clearing old cache entries', 'CacheOptimizer', { 
        total: stats.total,
        queryCache: stats.queryCache,
        reactQuery: stats.reactQuery
      });
      
      // Clear custom query cache
      queryCache.clear();
      
      // Clear prefetch cache
      prefetchManager.clear();
      
      // Clear React Query cache (selective)
      queryClient.clear();
    }
  }

  /**
   * Get unified cache health metrics
   */
  getStats(): CacheStats {
    const queryStats = queryCache.getStats();
    
    return {
      queryCache: queryStats.size,
      reactQuery: queryClient.getQueryCache().getAll().length,
      prefetch: 0, // PrefetchManager doesn't expose size
      total: queryStats.size + queryClient.getQueryCache().getAll().length
    };
  }

  /**
   * Force clear ALL caches across the entire application
   */
  clearAll(): void {
    logger.info('Clearing ALL application caches', 'CacheOptimizer');
    
    // Clear all cache systems
    queryCache.clear();
    prefetchManager.clear();
    queryClient.clear();
    
    // Clear service worker cache if available
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
    
    logger.info('All caches cleared successfully', 'CacheOptimizer');
  }

  /**
   * Refresh specific data by invalidating related caches
   */
  refreshData(patterns: string[]): void {
    patterns.forEach(pattern => {
      queryCache.invalidatePattern(new RegExp(pattern));
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey.some(k => 
          typeof k === 'string' && k.includes(pattern)
        )
      });
    });
  }
}

export const cacheOptimizer = new CacheOptimizerSystem();

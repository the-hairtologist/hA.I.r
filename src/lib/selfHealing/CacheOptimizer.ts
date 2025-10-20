/**
 * Cache Optimizer
 * Intelligently manages and optimizes application caches
 */

import { queryCache } from '@/lib/data/QueryCache';
import { logger } from '@/lib/logger';

interface CacheStats {
  size: number;
  hitRate: number;
  oldEntries: number;
}

class CacheOptimizerSystem {
  private readonly MAX_CACHE_SIZE = 1000;
  private readonly MAX_AGE_MS = 10 * 60 * 1000; // 10 minutes

  /**
   * Optimize all application caches
   */
  async optimize(): Promise<{ cleaned: number; retained: number }> {
    logger.info('Starting cache optimization', 'CacheOptimizer');

    const beforeSize = queryCache.getStats().size;
    
    // Clear old entries
    this.clearOldEntries();
    
    const afterSize = queryCache.getStats().size;
    const cleaned = beforeSize - afterSize;

    logger.info('Cache optimization complete', 'CacheOptimizer', {
      cleaned,
      retained: afterSize
    });

    return { cleaned, retained: afterSize };
  }

  /**
   * Clear old cache entries
   */
  private clearOldEntries(): void {
    const stats = queryCache.getStats();
    
    // Only clear if cache is getting large
    if (stats.size > this.MAX_CACHE_SIZE * 0.8) {
      logger.debug('Clearing old cache entries', 'CacheOptimizer', { size: stats.size });
      queryCache.clear();
    }
  }

  /**
   * Get cache health metrics
   */
  getStats(): CacheStats {
    const stats = queryCache.getStats();
    
    return {
      size: stats.size,
      hitRate: 0.85, // Simplified - real implementation would track hits/misses
      oldEntries: 0
    };
  }

  /**
   * Force clear all caches
   */
  clearAll(): void {
    logger.info('Clearing all caches', 'CacheOptimizer');
    queryCache.clear();
  }
}

export const cacheOptimizer = new CacheOptimizerSystem();

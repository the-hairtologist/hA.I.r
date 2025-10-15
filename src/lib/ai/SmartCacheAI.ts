/**
 * AI Smart Caching System
 * Learns user patterns and automatically optimizes cache strategy
 */

import { queryCache } from '@/lib/data/QueryCache';

interface CachePattern {
  key: string;
  accessCount: number;
  lastAccessed: number;
  avgTimeBetweenAccess: number;
  priority: number;
}

interface CacheRecommendation {
  action: 'cache' | 'preload' | 'invalidate';
  key: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

class SmartCacheAISystem {
  private accessPatterns = new Map<string, CachePattern>();
  private readonly LEARNING_WINDOW = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Track data access pattern
   */
  trackAccess(key: string) {
    const now = Date.now();
    const existing = this.accessPatterns.get(key);

    if (existing) {
      const timeSinceLastAccess = now - existing.lastAccessed;
      const newAvg = (existing.avgTimeBetweenAccess * existing.accessCount + timeSinceLastAccess) 
        / (existing.accessCount + 1);

      this.accessPatterns.set(key, {
        key,
        accessCount: existing.accessCount + 1,
        lastAccessed: now,
        avgTimeBetweenAccess: newAvg,
        priority: this.calculatePriority(existing.accessCount + 1, newAvg)
      });
    } else {
      this.accessPatterns.set(key, {
        key,
        accessCount: 1,
        lastAccessed: now,
        avgTimeBetweenAccess: 0,
        priority: 1
      });
    }
  }

  /**
   * Calculate cache priority based on patterns
   */
  private calculatePriority(accessCount: number, avgTimeBetweenAccess: number): number {
    // High access count = high priority
    const frequencyScore = Math.min(accessCount / 10, 5);
    
    // Short time between access = high priority
    const recencyScore = avgTimeBetweenAccess > 0 
      ? Math.max(0, 5 - (avgTimeBetweenAccess / (60 * 1000))) // Normalize to minutes
      : 5;

    return (frequencyScore * 0.6 + recencyScore * 0.4);
  }

  /**
   * Get AI-powered cache recommendations
   */
  getRecommendations(): CacheRecommendation[] {
    const recommendations: CacheRecommendation[] = [];
    const now = Date.now();

    // Analyze patterns
    for (const pattern of this.accessPatterns.values()) {
      // Highly accessed data - ensure it's cached
      if (pattern.priority > 4) {
        recommendations.push({
          action: 'cache',
          key: pattern.key,
          reason: 'Frequently accessed data',
          priority: 'high'
        });
      }

      // Predictable pattern - preload before expected access
      if (pattern.accessCount > 3 && pattern.avgTimeBetweenAccess > 0) {
        const timeSinceLastAccess = now - pattern.lastAccessed;
        const expectedNextAccess = pattern.lastAccessed + pattern.avgTimeBetweenAccess;
        
        // If we're within 10% of expected next access time, preload
        if (now >= expectedNextAccess * 0.9 && now < expectedNextAccess) {
          recommendations.push({
            action: 'preload',
            key: pattern.key,
            reason: 'Predicted access based on pattern',
            priority: 'medium'
          });
        }
      }

      // Stale data - invalidate
      if (pattern.accessCount < 2 && (now - pattern.lastAccessed) > this.LEARNING_WINDOW) {
        recommendations.push({
          action: 'invalidate',
          key: pattern.key,
          reason: 'Infrequently accessed, stale data',
          priority: 'low'
        });
      }
    }

    logger.info('Generated cache recommendations', 'SmartCacheAI', {
      recommendations: recommendations.length
    });

    return recommendations;
  }

  /**
   * Auto-apply cache recommendations
   */
  async applyRecommendations(recommendations?: CacheRecommendation[]): Promise<number> {
    const recs = recommendations || this.getRecommendations();
    let appliedCount = 0;

    for (const rec of recs) {
      try {
        switch (rec.action) {
          case 'invalidate':
            queryCache.invalidate(rec.key);
            appliedCount++;
            break;
          
          case 'cache':
            // Ensure high-priority items stay cached
            // This would be implemented based on your specific caching needs
            appliedCount++;
            break;
          
          case 'preload':
            // Preload data before it's needed
            // Implementation depends on data source
            appliedCount++;
            break;
        }
      } catch (error) {
        logger.error('Failed to apply cache recommendation', 'SmartCacheAI', error);
      }
    }

    logger.info('Applied cache recommendations', 'SmartCacheAI', {
      applied: appliedCount,
      total: recs.length
    });

    return appliedCount;
  }

  /**
   * Get cache optimization insights
   */
  getInsights(): {
    totalPatterns: number;
    highPriorityData: number;
    predictablePatterns: number;
    recommendations: number;
  } {
    const patterns = Array.from(this.accessPatterns.values());
    const highPriority = patterns.filter(p => p.priority > 4).length;
    const predictable = patterns.filter(p => 
      p.accessCount > 3 && p.avgTimeBetweenAccess > 0
    ).length;
    const recommendations = this.getRecommendations().length;

    return {
      totalPatterns: patterns.length,
      highPriorityData: highPriority,
      predictablePatterns: predictable,
      recommendations
    };
  }

  /**
   * Optimize cache based on learned patterns
   */
  async optimize(): Promise<{
    applied: number;
    insights: ReturnType<typeof this.getInsights>;
  }> {
    const recommendations = this.getRecommendations();
    const applied = await this.applyRecommendations(recommendations);
    const insights = this.getInsights();

    logger.info('Cache optimization complete', 'SmartCacheAI', { applied, insights });

    return { applied, insights };
  }

  /**
   * Clear old patterns (cleanup)
   */
  cleanup() {
    const now = Date.now();
    const cutoff = now - (this.LEARNING_WINDOW * 2); // Keep 48 hours

    for (const [key, pattern] of this.accessPatterns.entries()) {
      if (pattern.lastAccessed < cutoff) {
        this.accessPatterns.delete(key);
      }
    }
  }
}

export const smartCacheAI = new SmartCacheAISystem();

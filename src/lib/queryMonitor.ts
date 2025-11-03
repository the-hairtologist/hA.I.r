/**
 * Query Performance Monitor
 * Tracks query frequency, detects duplicates, and logs slow queries
 */

interface QueryMetric {
  queryKey: string;
  component: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'pending' | 'success' | 'error';
}

class QueryMonitor {
  private queries: Map<string, QueryMetric[]> = new Map();
  private slowQueryThreshold = 500; // ms
  private duplicateWindow = 100; // ms
  private enabled = import.meta.env.DEV; // Only in development

  /**
   * Start tracking a query
   */
  startQuery(queryKey: string, component: string): string {
    if (!this.enabled) return '';

    const id = `${queryKey}_${Date.now()}_${Math.random()}`;
    const metric: QueryMetric = {
      queryKey,
      component,
      startTime: Date.now(),
      status: 'pending',
    };

    if (!this.queries.has(queryKey)) {
      this.queries.set(queryKey, []);
    }
    this.queries.get(queryKey)!.push(metric);

    // Check for duplicate queries in same render cycle
    this.checkDuplicates(queryKey, component);

    return id;
  }

  /**
   * End tracking a query
   */
  endQuery(queryKey: string, status: 'success' | 'error') {
    if (!this.enabled) return;

    const metrics = this.queries.get(queryKey);
    if (!metrics || metrics.length === 0) return;

    const metric = metrics[metrics.length - 1];
    const now = Date.now();
    metric.endTime = now;
    metric.duration = now - metric.startTime;
    metric.status = status;

    // Log slow queries
    if (metric.duration > this.slowQueryThreshold) {
      console.warn(`🐌 Slow query detected (${metric.duration}ms):`, {
        queryKey,
        component: metric.component,
        duration: metric.duration,
      });
    }
  }

  /**
   * Check for duplicate queries in same time window
   */
  private checkDuplicates(queryKey: string, component: string) {
    const metrics = this.queries.get(queryKey) || [];
    const now = Date.now();

    const recentQueries = metrics.filter(
      m => now - m.startTime < this.duplicateWindow && m.status === 'pending'
    );

    if (recentQueries.length > 1) {
      console.warn(`⚠️ Duplicate query detected in ${component}:`, {
        queryKey,
        count: recentQueries.length,
        suggestion: 'Consider using React Query caching or combining queries',
      });
    }
  }

  /**
   * Get statistics for a query key
   */
  getStats(queryKey: string) {
    const metrics = this.queries.get(queryKey) || [];
    if (metrics.length === 0) return null;

    const successful = metrics.filter(m => m.status === 'success');
    const durations = successful
      .map(m => m.duration)
      .filter((d): d is number => d !== undefined);

    return {
      totalQueries: metrics.length,
      successfulQueries: successful.length,
      averageDuration:
        durations.reduce((a, b) => a + b, 0) / durations.length || 0,
      slowQueries: durations.filter(d => d > this.slowQueryThreshold).length,
    };
  }

  /**
   * Get all statistics
   */
  getAllStats() {
    const stats: Record<string, any> = {};
    for (const [key] of this.queries) {
      stats[key] = this.getStats(key);
    }
    return stats;
  }

  /**
   * Clear old metrics (keep last hour)
   */
  cleanup() {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    for (const [key, metrics] of this.queries) {
      const recent = metrics.filter(m => m.startTime > oneHourAgo);
      if (recent.length === 0) {
        this.queries.delete(key);
      } else {
        this.queries.set(key, recent);
      }
    }
  }

  /**
   * Export metrics for analytics
   */
  exportMetrics() {
    return {
      queries: Array.from(this.queries.entries()).map(([key, metrics]) => ({
        queryKey: key,
        metrics: metrics.map(m => ({
          component: m.component,
          duration: m.duration,
          status: m.status,
          timestamp: m.startTime,
        })),
      })),
      summary: this.getAllStats(),
    };
  }
}

export const queryMonitor = new QueryMonitor();

// Cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(
    () => {
      queryMonitor.cleanup();
    },
    5 * 60 * 1000
  );
}

// Export metrics to console on demand
if (typeof window !== 'undefined') {
  (window as any).getQueryMetrics = () => {
    console.table(queryMonitor.getAllStats());
    return queryMonitor.exportMetrics();
  };
}

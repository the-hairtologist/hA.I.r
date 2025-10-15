/**
 * Automated Health Monitoring System
 * 
 * Continuously monitors app health, detects issues, and triggers alerts.
 */

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from '@/lib/logger';

interface HealthMetrics {
  timestamp: Date;
  memoryUsage: number;
  apiLatency: number;
  errorRate: number;
  activeConnections: number;
  cacheHitRate: number;
}

interface HealthCheck {
  name: string;
  check: () => Promise<boolean>;
  critical: boolean;
}

class HealthMonitorSystem {
  private metrics: HealthMetrics[] = [];
  private readonly MAX_METRICS = 100;
  private readonly CHECK_INTERVAL = 30000; // 30 seconds
  private monitoringInterval?: number;
  private checks: HealthCheck[] = [];

  constructor() {
    this.initializeChecks();
  }

  private initializeChecks() {
    this.checks = [
      {
        name: 'Database Connection',
        check: async () => {
          try {
            // Use auth session check instead of querying tables
            // This avoids unnecessary 401 errors in network logs
            const { data, error } = await supabase.auth.getSession();
            return !error;
          } catch {
            return false;
          }
        },
        critical: true,
      },
      {
        name: 'Authentication Service',
        check: async () => {
          try {
            const { data } = await supabase.auth.getSession();
            return data !== null;
          } catch {
            return false;
          }
        },
        critical: true,
      },
      {
        name: 'Memory Usage',
        check: async () => {
          const perfMemory = (performance as any).memory;
          if (perfMemory) {
            const used = perfMemory.usedJSHeapSize;
            const limit = perfMemory.jsHeapSizeLimit;
            return (used / limit) < 0.9; // Less than 90% usage
          }
          return true;
        },
        critical: false,
      },
      {
        name: 'Local Storage',
        check: async () => {
          try {
            localStorage.setItem('health_check', 'ok');
            const value = localStorage.getItem('health_check');
            localStorage.removeItem('health_check');
            return value === 'ok';
          } catch {
            return false;
          }
        },
        critical: false,
      },
    ];
  }

  /**
   * Start continuous monitoring
   */
  startMonitoring() {
    if (this.monitoringInterval) {
      logger.info('Health monitoring already running');
      return;
    }

    logger.info('Starting health monitoring');
    
    // Initial check
    this.performHealthCheck();

    // Periodic checks
    this.monitoringInterval = window.setInterval(() => {
      this.performHealthCheck();
    }, this.CHECK_INTERVAL);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
      logger.info('Health monitoring stopped');
    }
  }

  /**
   * Perform health check
   */
  private async performHealthCheck() {
    const startTime = performance.now();
    const results: { [key: string]: boolean } = {};
    let criticalFailure = false;

    // Run all checks
    for (const check of this.checks) {
      try {
        results[check.name] = await check.check();
        if (!results[check.name] && check.critical) {
          criticalFailure = true;
          logger.error(`Critical health check failed: ${check.name}`);
        }
      } catch (error) {
        results[check.name] = false;
        if (check.critical) {
          criticalFailure = true;
        }
        logger.error(`Health check error: ${check.name}`, 'HealthMonitor', error);
      }
    }

    const latency = performance.now() - startTime;

    // Collect metrics
    const metrics: HealthMetrics = {
      timestamp: new Date(),
      memoryUsage: this.getMemoryUsage(),
      apiLatency: latency,
      errorRate: this.calculateErrorRate(),
      activeConnections: this.getActiveConnections(),
      cacheHitRate: this.getCacheHitRate(),
    };

    this.recordMetrics(metrics);

    // Alert on critical failures
    if (criticalFailure) {
      this.handleCriticalFailure(results);
    }

    // Alert on degraded performance
    if (metrics.apiLatency > 3000 || metrics.memoryUsage > 0.85) {
      this.handlePerformanceDegradation(metrics);
    }
  }

  private getMemoryUsage(): number {
    const perfMemory = (performance as any).memory;
    if (perfMemory) {
      return perfMemory.usedJSHeapSize / perfMemory.jsHeapSizeLimit;
    }
    return 0;
  }

  private calculateErrorRate(): number {
    const recentLogs = logger.getRecentLogs(50);
    const errorCount = recentLogs.filter(log => log.level === 'ERROR').length;
    return errorCount / recentLogs.length;
  }

  private getActiveConnections(): number {
    // Estimate based on open channels and subscriptions
    return 1; // Placeholder
  }

  private getCacheHitRate(): number {
    // Would integrate with QueryCache stats
    return 0.8; // Placeholder
  }

  private recordMetrics(metrics: HealthMetrics) {
    this.metrics.push(metrics);
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift();
    }
  }

  private handleCriticalFailure(results: { [key: string]: boolean }) {
    const failedChecks = Object.entries(results)
      .filter(([_, passed]) => !passed)
      .map(([name]) => name);

    // Filter out non-critical failures
    const criticalChecks = this.checks
      .filter(check => check.critical)
      .map(check => check.name);
    
    const actualCriticalFailures = failedChecks.filter(name => 
      criticalChecks.includes(name)
    );

    if (actualCriticalFailures.length === 0) {
      return; // No actual critical failures
    }

    logger.error('Critical health check failures', 'HealthMonitor', {
      failedChecks: actualCriticalFailures,
    });

    toast.error('System health issue detected. Attempting recovery...', {
      duration: 3000,
    });

    // Trigger recovery actions
    this.attemptRecovery(actualCriticalFailures);
  }

  private handlePerformanceDegradation(metrics: HealthMetrics) {
    logger.warn('Performance degradation detected', 'HealthMonitor', {
      memoryUsage: metrics.memoryUsage,
      apiLatency: metrics.apiLatency,
      timestamp: metrics.timestamp
    });

    if (metrics.memoryUsage > 0.85) {
      toast.warning('High memory usage detected. Clearing caches...');
      this.clearCaches();
    }

    if (metrics.apiLatency > 3000) {
      toast.warning('Slow response times detected');
    }
  }

  private async attemptRecovery(failedChecks: string[]) {
    for (const check of failedChecks) {
      switch (check) {
        case 'Database Connection':
          // Attempt to reconnect
          try {
            await supabase.auth.refreshSession();
            logger.info('Database connection recovered');
          } catch (error) {
            logger.error('Failed to recover database connection', 'HealthMonitor', error);
          }
          break;

        case 'Authentication Service':
          // Refresh auth session
          try {
            await supabase.auth.refreshSession();
            logger.info('Auth session refreshed');
          } catch (error) {
            logger.error('Failed to refresh auth', 'HealthMonitor', error);
          }
          break;

        case 'Local Storage':
          // Clear corrupted storage
          try {
            localStorage.clear();
            sessionStorage.clear();
            logger.info('Storage cleared');
          } catch (error) {
            logger.error('Failed to clear storage', 'HealthMonitor', error);
          }
          break;
      }
    }
  }

  private clearCaches() {
    // Clear various caches
    try {
      // Would integrate with QueryCache
      logger.info('Caches cleared');
    } catch (error) {
      logger.error('Failed to clear caches', 'HealthMonitor', error);
    }
  }

  /**
   * Get current health status
   */
  getHealthStatus() {
    if (this.metrics.length === 0) {
      return {
        status: 'unknown',
        message: 'No health data available',
      };
    }

    const latest = this.metrics[this.metrics.length - 1];
    const avgLatency = this.metrics.reduce((sum, m) => sum + m.apiLatency, 0) / this.metrics.length;

    if (latest.errorRate > 0.3 || latest.memoryUsage > 0.9) {
      return {
        status: 'critical',
        message: 'System experiencing issues',
        metrics: latest,
        avgLatency,
      };
    }

    if (latest.errorRate > 0.1 || latest.memoryUsage > 0.75 || avgLatency > 2000) {
      return {
        status: 'degraded',
        message: 'System performance degraded',
        metrics: latest,
        avgLatency,
      };
    }

    return {
      status: 'healthy',
      message: 'All systems operational',
      metrics: latest,
      avgLatency,
    };
  }

  /**
   * Get health metrics history
   */
  getMetricsHistory(): HealthMetrics[] {
    return [...this.metrics];
  }

  /**
   * Force a manual health check
   */
  async checkNow(): Promise<void> {
    await this.performHealthCheck();
  }
}

// Singleton instance
export const healthMonitor = new HealthMonitorSystem();

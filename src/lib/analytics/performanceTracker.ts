/**
 * Performance Tracker Service
 * Enhanced Web Vitals and custom performance tracking
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface PerformanceMetric {
  metricName: string;
  metricValue: number;
  rating?: 'good' | 'needs-improvement' | 'poor';
  pagePath?: string;
}

class PerformanceTracker {
  /**
   * Track a performance metric
   */
  async trackMetric(params: PerformanceMetric) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('performance_metrics')
        .insert({
          user_id: user?.id || null,
          metric_name: params.metricName,
          metric_value: params.metricValue,
          rating: params.rating,
          page_path: params.pagePath || window.location.pathname,
          device_type: this.getDeviceType(),
          connection_type: this.getConnectionType(),
        });

      if (error) throw error;

      if (import.meta.env.DEV) {
        logger.debug(
          `[PerformanceTracker] ${params.metricName}: ${Math.round(params.metricValue)}ms`,
          'performanceTracker'
        );
      }
    } catch (error) {
      logger.error('[PerformanceTracker] Failed to track metric', 'performanceTracker', error);
    }
  }

  /**
   * Track Web Vitals metrics
   */
  async trackWebVital(metric: any) {
    const rating = this.getRating(metric.name, metric.value);

    await this.trackMetric({
      metricName: metric.name,
      metricValue: metric.value,
      rating,
    });
  }

  /**
   * Get rating for metric
   */
  private getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds: Record<string, [number, number]> = {
      CLS: [0.1, 0.25],
      INP: [200, 500],
      FCP: [1800, 3000],
      LCP: [2500, 4000],
      TTFB: [800, 1800],
    };

    const [good, poor] = thresholds[name] || [0, 0];
    if (value <= good) return 'good';
    if (value <= poor) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Get device type
   */
  private getDeviceType(): string {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  }

  /**
   * Get connection type
   */
  private getConnectionType(): string {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    return connection?.effectiveType || 'unknown';
  }

  /**
   * Track custom performance mark
   */
  async trackCustomMark(markName: string, startMark?: string) {
    try {
      if (!performance || !performance.measure) return;

      const measureName = `${markName}_duration`;
      performance.mark(markName);

      if (startMark) {
        performance.measure(measureName, startMark, markName);
        const measure = performance.getEntriesByName(measureName)[0];
        
        await this.trackMetric({
          metricName: measureName,
          metricValue: measure.duration,
        });
      }
    } catch (error) {
      logger.error('[PerformanceTracker] Failed to track custom mark', 'performanceTracker', error);
    }
  }
}

export const performanceTracker = new PerformanceTracker();

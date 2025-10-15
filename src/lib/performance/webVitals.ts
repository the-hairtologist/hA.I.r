/**
 * Web Vitals Monitoring
 * Tracks Core Web Vitals (LCP, FID, CLS, FCP, TTFB)
 */

import { logger } from '@/lib/logger';

interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

type MetricCallback = (metric: WebVitalMetric) => void;

class WebVitalsMonitor {
  private metrics: Map<string, WebVitalMetric> = new Map();
  private callbacks: MetricCallback[] = [];

  /**
   * Initialize Web Vitals tracking
   */
  async init() {
    if (typeof window === 'undefined') return;

    try {
      // Dynamic import to reduce bundle size
      const { onCLS, onINP, onFCP, onLCP, onTTFB } = await import('web-vitals');

      onCLS(this.handleMetric.bind(this));
      onINP(this.handleMetric.bind(this));
      onFCP(this.handleMetric.bind(this));
      onLCP(this.handleMetric.bind(this));
      onTTFB(this.handleMetric.bind(this));

      logger.debug('📊 Web Vitals monitoring initialized', 'webVitals');
    } catch (error) {
      logger.warn('Web Vitals library not available', 'webVitals', error);
    }
  }

  /**
   * Handle metric updates
   */
  private handleMetric(metric: any) {
    const webVitalMetric: WebVitalMetric = {
      name: metric.name,
      value: metric.value,
      rating: this.getRating(metric.name, metric.value),
      delta: metric.delta,
      id: metric.id,
    };

    this.metrics.set(metric.name, webVitalMetric);
    this.callbacks.forEach(cb => cb(webVitalMetric));

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      logger.debug(`${metric.name}`, 'webVitals', {
        value: `${Math.round(metric.value)}ms`,
        rating: webVitalMetric.rating,
        ...metric
      });
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(webVitalMetric);
    }
  }

  /**
   * Get rating based on thresholds
   */
  private getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds: Record<string, [number, number]> = {
      CLS: [0.1, 0.25],
      INP: [200, 500], // Updated from FID
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
   * Send metrics to analytics
   */
  private sendToAnalytics(metric: WebVitalMetric) {
    // Could integrate with Google Analytics, Mixpanel, etc.
    if (window.gtag) {
      window.gtag('event', metric.name, {
        event_category: 'Web Vitals',
        value: Math.round(metric.value),
        metric_rating: metric.rating,
        non_interaction: true,
      });
    }
  }

  /**
   * Subscribe to metric updates
   */
  onMetric(callback: MetricCallback) {
    this.callbacks.push(callback);
  }

  /**
   * Get all collected metrics
   */
  getMetrics(): WebVitalMetric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get specific metric
   */
  getMetric(name: string): WebVitalMetric | undefined {
    return this.metrics.get(name);
  }
}

export const webVitalsMonitor = new WebVitalsMonitor();

// Auto-initialize in browser
if (typeof window !== 'undefined') {
  webVitalsMonitor.init();
}

// Type augmentation for gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

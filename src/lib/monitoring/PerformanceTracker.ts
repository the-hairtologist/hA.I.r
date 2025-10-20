import { analytics } from '../analytics';
import { logger } from '../logging/productionLogger';

/**
 * Performance tracking for Core Web Vitals and custom metrics
 */

class PerformanceTracker {
  private metrics: Map<string, number> = new Map();
  private initialized = false;

  initialize() {
    if (this.initialized || typeof window === 'undefined') return;

    // Track page load performance
    window.addEventListener('load', () => {
      this.trackPageLoad();
    });

    // Track Core Web Vitals when available
    this.observeWebVitals();

    this.initialized = true;
    logger.info('[Performance] Tracker initialized');
  }

  private trackPageLoad() {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (perfData) {
      const loadTime = perfData.loadEventEnd - perfData.fetchStart;
      const domContentLoaded = perfData.domContentLoadedEventEnd - perfData.fetchStart;
      const firstPaint = performance.getEntriesByName('first-paint')[0]?.startTime || 0;

      analytics.track('page_load_performance', {
        load_time: Math.round(loadTime),
        dom_content_loaded: Math.round(domContentLoaded),
        first_paint: Math.round(firstPaint),
      });

      logger.info('[Performance] Page load:', {
        loadTime: Math.round(loadTime) + 'ms',
        domContentLoaded: Math.round(domContentLoaded) + 'ms',
      });
    }
  }

  private observeWebVitals() {
    // Largest Contentful Paint (LCP)
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        
        if (lastEntry) {
          analytics.track('web_vitals', {
            metric: 'LCP',
            value: Math.round(lastEntry.renderTime || lastEntry.loadTime),
          });
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      console.warn('[Performance] LCP observer not supported');
    }

    // First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          analytics.track('web_vitals', {
            metric: 'FID',
            value: Math.round(entry.processingStart - entry.startTime),
          });
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (error) {
      console.warn('[Performance] FID observer not supported');
    }

    // Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // Report CLS on page unload
      window.addEventListener('beforeunload', () => {
        analytics.track('web_vitals', {
          metric: 'CLS',
          value: Math.round(clsValue * 1000) / 1000,
        });
      });
    } catch (error) {
      console.warn('[Performance] CLS observer not supported');
    }
  }

  /**
   * Track custom performance metric
   */
  startMark(name: string) {
    performance.mark(`${name}-start`);
  }

  endMark(name: string) {
    performance.mark(`${name}-end`);
    
    try {
      performance.measure(name, `${name}-start`, `${name}-end`);
      const measure = performance.getEntriesByName(name)[0];
      
      if (measure) {
        this.metrics.set(name, measure.duration);
        
        analytics.track('custom_performance', {
          metric_name: name,
          duration: Math.round(measure.duration),
        });

        logger.info(`[Performance] ${name}: ${Math.round(measure.duration)}ms`);
      }
    } catch (error) {
      console.warn(`[Performance] Failed to measure ${name}:`, error);
    }
  }

  /**
   * Get all tracked metrics
   */
  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  /**
   * Track API call performance
   */
  async trackAPICall<T>(
    name: string,
    apiCall: () => Promise<T>
  ): Promise<T> {
    this.startMark(name);
    
    try {
      const result = await apiCall();
      this.endMark(name);
      return result;
    } catch (error) {
      this.endMark(name);
      throw error;
    }
  }
}

export const performanceTracker = new PerformanceTracker();

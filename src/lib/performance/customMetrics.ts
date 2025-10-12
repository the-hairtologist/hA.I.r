/**
 * Custom Performance Metrics
 * Track custom performance marks and measures
 */

interface PerformanceMark {
  name: string;
  startTime: number;
}

interface PerformanceMeasure {
  name: string;
  duration: number;
  startTime: number;
  endTime: number;
}

class CustomMetricsTracker {
  private marks: Map<string, PerformanceMark> = new Map();
  private measures: PerformanceMeasure[] = [];

  /**
   * Create a performance mark
   */
  mark(name: string) {
    if (!performance.mark) return;

    performance.mark(name);
    this.marks.set(name, {
      name,
      startTime: performance.now(),
    });
  }

  /**
   * Measure duration between two marks
   */
  measure(name: string, startMark: string, endMark?: string) {
    if (!performance.measure) return;

    try {
      const measure = performance.measure(name, startMark, endMark);
      
      const customMeasure: PerformanceMeasure = {
        name,
        duration: measure.duration,
        startTime: measure.startTime,
        endTime: measure.startTime + measure.duration,
      };

      this.measures.push(customMeasure);

      if (process.env.NODE_ENV === 'development') {
        console.log(`⏱️ ${name}: ${Math.round(measure.duration)}ms`);
      }

      return customMeasure;
    } catch (error) {
      console.warn(`Failed to measure ${name}:`, error);
    }
  }

  /**
   * Track component render time
   */
  trackRender(componentName: string, callback: () => void) {
    const startMark = `${componentName}-render-start`;
    const endMark = `${componentName}-render-end`;

    this.mark(startMark);
    callback();
    this.mark(endMark);
    this.measure(`${componentName} render`, startMark, endMark);
  }

  /**
   * Track async operation duration
   */
  async trackAsync<T>(name: string, operation: () => Promise<T>): Promise<T> {
    const startMark = `${name}-start`;
    const endMark = `${name}-end`;

    this.mark(startMark);
    try {
      const result = await operation();
      this.mark(endMark);
      this.measure(name, startMark, endMark);
      return result;
    } catch (error) {
      this.mark(endMark);
      this.measure(`${name} (failed)`, startMark, endMark);
      throw error;
    }
  }

  /**
   * Track navigation timing
   */
  trackNavigation() {
    if (!performance.getEntriesByType) return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (!navigation) return;

    const metrics = {
      dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcpConnection: navigation.connectEnd - navigation.connectStart,
      requestTime: navigation.responseStart - navigation.requestStart,
      responseTime: navigation.responseEnd - navigation.responseStart,
      domProcessing: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      fullPageLoad: navigation.loadEventEnd - navigation.loadEventStart,
    };

    console.log('📈 Navigation Metrics:', metrics);
    return metrics;
  }

  /**
   * Get all measures
   */
  getMeasures(): PerformanceMeasure[] {
    return [...this.measures];
  }

  /**
   * Clear all marks and measures
   */
  clear() {
    this.marks.clear();
    this.measures = [];
    
    if (performance.clearMarks) {
      performance.clearMarks();
    }
    if (performance.clearMeasures) {
      performance.clearMeasures();
    }
  }

  /**
   * Get resource timing
   */
  getResourceTiming() {
    if (!performance.getEntriesByType) return [];

    return performance.getEntriesByType('resource').map(entry => ({
      name: entry.name,
      duration: entry.duration,
      size: (entry as PerformanceResourceTiming).transferSize,
      type: (entry as PerformanceResourceTiming).initiatorType,
    }));
  }
}

export const customMetrics = new CustomMetricsTracker();

// Track initial page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      customMetrics.trackNavigation();
    }, 0);
  });
}

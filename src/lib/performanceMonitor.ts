/**
 * Performance Monitoring & Optimization
 * Tracks Core Web Vitals and provides performance insights
 */

interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private observers: PerformanceObserver[] = [];

  init() {
    if (typeof window === 'undefined') return;

    this.observeFCP();
    this.observeLCP();
    this.observeFID();
    this.observeCLS();
    this.observeTTFB();
  }

  private observeFCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.fcp = entry.startTime;
            console.log(`[Performance] FCP: ${entry.startTime.toFixed(2)}ms`);
          }
        }
      });
      observer.observe({ entryTypes: ['paint'] });
      this.observers.push(observer);
    } catch (e) {
      console.warn('FCP observation not supported');
    }
  }

  private observeLCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.lcp = lastEntry.startTime;
        console.log(`[Performance] LCP: ${lastEntry.startTime.toFixed(2)}ms`);
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(observer);
    } catch (e) {
      console.warn('LCP observation not supported');
    }
  }

  private observeFID() {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fidEntry = entry as any;
          this.metrics.fid = fidEntry.processingStart - fidEntry.startTime;
          console.log(`[Performance] FID: ${this.metrics.fid.toFixed(2)}ms`);
        }
      });
      observer.observe({ entryTypes: ['first-input'] });
      this.observers.push(observer);
    } catch (e) {
      console.warn('FID observation not supported');
    }
  }

  private observeCLS() {
    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShift = entry as any;
          if (!layoutShift.hadRecentInput) {
            clsValue += layoutShift.value;
            this.metrics.cls = clsValue;
            console.log(`[Performance] CLS: ${clsValue.toFixed(4)}`);
          }
        }
      });
      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(observer);
    } catch (e) {
      console.warn('CLS observation not supported');
    }
  }

  private observeTTFB() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const navEntry = entry as PerformanceNavigationTiming;
          this.metrics.ttfb = navEntry.responseStart - navEntry.requestStart;
          console.log(`[Performance] TTFB: ${this.metrics.ttfb.toFixed(2)}ms`);
        });
      });
      observer.observe({ entryTypes: ['navigation'] });
      this.observers.push(observer);
    } catch (e) {
      console.warn('TTFB observation not supported');
    }
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  getScore(): number {
    let score = 100;
    
    // FCP scoring (good < 1800ms, needs improvement < 3000ms, poor >= 3000ms)
    if (this.metrics.fcp) {
      if (this.metrics.fcp > 3000) score -= 20;
      else if (this.metrics.fcp > 1800) score -= 10;
    }

    // LCP scoring (good < 2500ms, needs improvement < 4000ms, poor >= 4000ms)
    if (this.metrics.lcp) {
      if (this.metrics.lcp > 4000) score -= 25;
      else if (this.metrics.lcp > 2500) score -= 15;
    }

    // FID scoring (good < 100ms, needs improvement < 300ms, poor >= 300ms)
    if (this.metrics.fid) {
      if (this.metrics.fid > 300) score -= 20;
      else if (this.metrics.fid > 100) score -= 10;
    }

    // CLS scoring (good < 0.1, needs improvement < 0.25, poor >= 0.25)
    if (this.metrics.cls) {
      if (this.metrics.cls > 0.25) score -= 25;
      else if (this.metrics.cls > 0.1) score -= 15;
    }

    // TTFB scoring (good < 800ms, needs improvement < 1800ms, poor >= 1800ms)
    if (this.metrics.ttfb) {
      if (this.metrics.ttfb > 1800) score -= 10;
      else if (this.metrics.ttfb > 800) score -= 5;
    }

    return Math.max(0, score);
  }

  report() {
    const score = this.getScore();
    console.log('[Performance] Overall Score:', score);
    console.log('[Performance] Metrics:', this.getMetrics());
    
    return {
      score,
      metrics: this.getMetrics(),
      grade: score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F'
    };
  }

  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();

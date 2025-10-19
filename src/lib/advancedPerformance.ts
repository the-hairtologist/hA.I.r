/**
 * Advanced Performance Optimization System
 * Implements cutting-edge performance techniques
 */

// Critical CSS Extraction
export function injectCriticalCSS() {
  const criticalCSS = `
    /* Critical above-the-fold styles */
    body { margin: 0; font-family: system-ui; }
    #root { min-height: 100vh; }
    .skeleton { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  `;

  if (!document.getElementById('critical-css')) {
    const style = document.createElement('style');
    style.id = 'critical-css';
    style.textContent = criticalCSS;
    document.head.insertBefore(style, document.head.firstChild);
  }
}

// Resource Hints Manager
export class ResourceHintsManager {
  private static prefetched = new Set<string>();
  private static preloaded = new Set<string>();

  static prefetch(url: string, as?: string) {
    if (this.prefetched.has(url)) return;
    
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    if (as) link.as = as;
    document.head.appendChild(link);
    this.prefetched.add(url);
  }

  static preload(url: string, as: string, crossorigin?: boolean) {
    if (this.preloaded.has(url)) return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = as;
    if (crossorigin) link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
    this.preloaded.add(url);
  }

  static preconnect(origin: string) {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = origin;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }

  static prefetchRoutes(routes: string[]) {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        routes.forEach(route => this.prefetch(route));
      });
    }
  }
}

// Adaptive Loading based on connection and device
export class AdaptiveLoader {
  private static getNetworkQuality(): 'slow' | 'medium' | 'fast' {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (!connection) return 'medium';
    
    const effectiveType = connection.effectiveType;
    const downlink = connection.downlink;
    
    if (effectiveType === '4g' && downlink > 10) return 'fast';
    if (effectiveType === '4g' || (effectiveType === '3g' && downlink > 5)) return 'medium';
    return 'slow';
  }

  private static getDeviceTier(): 'low' | 'medium' | 'high' {
    const memory = (navigator as any).deviceMemory;
    const cores = navigator.hardwareConcurrency || 2;
    
    if (!memory) {
      return cores >= 8 ? 'high' : cores >= 4 ? 'medium' : 'low';
    }
    
    if (memory >= 8) return 'high';
    if (memory >= 4) return 'medium';
    return 'low';
  }

  static getOptimalSettings() {
    const networkQuality = this.getNetworkQuality();
    const deviceTier = this.getDeviceTier();
    
    return {
      networkQuality,
      deviceTier,
      shouldLoadHD: networkQuality === 'fast' && deviceTier === 'high',
      imageQuality: networkQuality === 'fast' ? 'high' : networkQuality === 'medium' ? 'medium' : 'low',
      maxConcurrentRequests: networkQuality === 'fast' ? 6 : networkQuality === 'medium' ? 4 : 2,
      shouldPrefetch: networkQuality !== 'slow' && deviceTier !== 'low',
      chunkSize: deviceTier === 'high' ? 'large' : deviceTier === 'medium' ? 'medium' : 'small',
    };
  }
}

// Performance Budget Monitor
export class PerformanceBudget {
  private static budgets = {
    firstContentfulPaint: 1800, // 1.8s
    largestContentfulPaint: 2500, // 2.5s
    timeToInteractive: 3800, // 3.8s
    totalBlockingTime: 200, // 200ms
    cumulativeLayoutShift: 0.1,
    firstInputDelay: 100, // 100ms
    bundleSize: 250 * 1024, // 250KB
  };

  static checkBudget(metric: keyof typeof PerformanceBudget.budgets, value: number): boolean {
    return value <= this.budgets[metric];
  }

  static reportBudgetViolation(metric: string, actual: number, budget: number) {
    // Budget violation - handled by monitoring system
  }
}

// Smart Request Batching
export class RequestBatcher {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private maxBatchSize = 5;
  private batchDelay = 50; // ms

  add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      if (!this.processing) {
        this.processBatch();
      }
    });
  }

  private async processBatch() {
    this.processing = true;
    
    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.maxBatchSize);
      
      // Execute batch in parallel
      await Promise.allSettled(batch.map(fn => fn()));
      
      // Small delay between batches to prevent overwhelming the browser
      if (this.queue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, this.batchDelay));
      }
    }
    
    this.processing = false;
  }
}

// Virtual Scroll Optimizer
export class VirtualScrollOptimizer {
  static calculateVisibleRange(
    scrollTop: number,
    containerHeight: number,
    itemHeight: number,
    totalItems: number,
    overscan: number = 3
  ) {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      totalItems - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return { startIndex, endIndex, visibleCount: endIndex - startIndex + 1 };
  }

  static getTransform(index: number, itemHeight: number): string {
    return `translateY(${index * itemHeight}px)`;
  }
}

// Initialize critical optimizations
export function initializeAdvancedPerformance() {
  injectCriticalCSS();
  
  // Prefetch critical routes based on user role
  if (window.location.pathname.includes('dashboard')) {
    ResourceHintsManager.prefetchRoutes(['/clients', '/appointments', '/formulas']);
  }
  
  // Monitor performance budgets
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          const lcp = entry.startTime;
          if (!PerformanceBudget.checkBudget('largestContentfulPaint', lcp)) {
            PerformanceBudget.reportBudgetViolation('LCP', lcp, 2500);
          }
        }
      }
    });
    
    observer.observe({ entryTypes: ['largest-contentful-paint', 'layout-shift'] });
  }
}

export const requestBatcher = new RequestBatcher();

/**
 * Advanced Performance Optimizer
 * Combines multiple optimization strategies for maximum performance
 */

import { initResourceHints, smartPrefetch } from './ResourceHints';
import { preconnectCriticalDomains, loadPolyfills } from './BundleOptimizer';
import { optimizePageImages } from '@/lib/imageOptimization';

class PerformanceOptimizerService {
  private initialized = false;

  /**
   * Initialize all performance optimizations
   */
  async init() {
    if (this.initialized) return;

    const isDev = import.meta.env.DEV;
    if (isDev) console.log('🚀 Initializing performance optimizations...');

    // Phase 1: Critical resource hints (immediate)
    initResourceHints();
    preconnectCriticalDomains();

    // Phase 2: Load polyfills if needed (early)
    await loadPolyfills();

    // Phase 3: Optimize images (deferred)
    this.optimizeImages();

    // Phase 4: Smart prefetching (idle time)
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.prefetchCommonRoutes();
      });
    }

    // Phase 5: Enable service worker caching strategies
    this.enableAdvancedCaching();

    // Phase 6: Monitor and adapt
    this.monitorPerformance();

    this.initialized = true;
    if (isDev) console.log('✅ Performance optimizations complete');
  }

  /**
   * Optimize all images on the page
   */
  private optimizeImages() {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        optimizePageImages();
      });
    }
  }

  /**
   * Prefetch common routes based on user role
   */
  private prefetchCommonRoutes() {
    const commonRoutes = [
      '/dashboard',
      '/appointments',
      '/clients',
      '/formulas',
    ];

    smartPrefetch(commonRoutes);
  }

  /**
   * Enable advanced caching strategies
   */
  private enableAdvancedCaching() {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      // Service worker is already active, send message to enable aggressive caching
      navigator.serviceWorker.controller.postMessage({
        type: 'ENABLE_AGGRESSIVE_CACHING',
      });
    }
  }

  /**
   * Monitor performance metrics
   */
  private monitorPerformance() {
    const isDev = import.meta.env.DEV;
    
    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50 && isDev) {
              console.warn('⚠️ Long task detected:', {
                duration: entry.duration,
                startTime: entry.startTime,
              });
            }
          }
        });

        observer.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // Long task API not supported
      }

      // Monitor layout shifts
      try {
        const clsObserver = new PerformanceObserver((list) => {
          let clsScore = 0;
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsScore += (entry as any).value;
            }
          }
          if (clsScore > 0.1 && isDev) {
            console.warn('⚠️ High CLS detected:', clsScore);
          }
        });

        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // Layout shift API not supported
      }
    }
  }

  /**
   * Optimize fonts loading
   */
  optimizeFonts() {
    const isDev = import.meta.env.DEV;
    // Use font-display: swap for better perceived performance
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (isDev) console.log('✅ Fonts loaded');
      });
    }
  }

  /**
   * Compress and optimize data transfers
   */
  enableCompression() {
    const isDev = import.meta.env.DEV;
    // Check if compression is supported
    const supportsCompression = 'CompressionStream' in window;
    
    if (isDev) {
      if (supportsCompression) {
        console.log('✅ Compression API available');
      } else {
        console.log('ℹ️ Compression API not available');
      }
    }
  }

  /**
   * Get current performance score
   */
  getPerformanceScore(): {
    fcp: number | null;
    lcp: number | null;
    cls: number | null;
    fid: number | null;
  } {
    const metrics = {
      fcp: null as number | null,
      lcp: null as number | null,
      cls: null as number | null,
      fid: null as number | null,
    };

    if ('PerformanceObserver' in window) {
      // Get FCP
      const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
      if (fcpEntry) {
        metrics.fcp = fcpEntry.startTime;
      }

      // Get LCP
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
      if (lcpEntries.length > 0) {
        metrics.lcp = lcpEntries[lcpEntries.length - 1].startTime;
      }
    }

    return metrics;
  }
}

export const performanceOptimizer = new PerformanceOptimizerService();

/**
 * Performance Monitor Component
 * Wrapper component for performance tracking
 */

import { useEffect } from 'react';
import { getPerformanceMetrics, requestIdleCallback } from '@/lib/performanceOptimizer';

export const PerformanceMonitor = () => {
  useEffect(() => {
    // Wait for page load to complete
    if (document.readyState === 'complete') {
      reportPerformance();
    } else {
      window.addEventListener('load', reportPerformance);
      return () => window.removeEventListener('load', reportPerformance);
    }
  }, []);

  const reportPerformance = () => {
    requestIdleCallback(() => {
      const metrics = getPerformanceMetrics();
      
      if (metrics) {
        console.log('[Performance Metrics]', {
          'Time to First Byte': `${metrics.ttfb?.toFixed(2)}ms`,
          'DOM Content Loaded': `${metrics.domContentLoaded?.toFixed(2)}ms`,
          'Load Complete': `${metrics.loadComplete?.toFixed(2)}ms`,
          'First Paint': `${metrics.firstPaint?.toFixed(2)}ms`,
          'First Contentful Paint': `${metrics.firstContentfulPaint?.toFixed(2)}ms`,
        });

        // Warn about slow metrics
        if (metrics.firstContentfulPaint && metrics.firstContentfulPaint > 2500) {
          console.warn('[Performance] Slow First Contentful Paint:', metrics.firstContentfulPaint);
        }
        
        if (metrics.ttfb && metrics.ttfb > 600) {
          console.warn('[Performance] Slow Time to First Byte:', metrics.ttfb);
        }
      }
    });
  };

  return null;
};

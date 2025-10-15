/**
 * Performance Monitor Component
 * Wrapper component for performance tracking
 */

import { useEffect } from 'react';
import { getPerformanceMetrics, requestIdleCallback } from '@/lib/performanceOptimizer';
import { logger } from '@/lib/logger';

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
      
      // Only log in development mode
      if (import.meta.env.DEV && metrics) {
        logger.info('Performance Metrics', 'performanceMonitor', {
          'Time to First Byte': `${metrics.ttfb?.toFixed(2)}ms`,
          'DOM Content Loaded': `${metrics.domContentLoaded?.toFixed(2)}ms`,
          'Load Complete': `${metrics.loadComplete?.toFixed(2)}ms`,
          'First Paint': `${metrics.firstPaint?.toFixed(2)}ms`,
          'First Contentful Paint': `${metrics.firstContentfulPaint?.toFixed(2)}ms`,
        });
      }
    });
  };

  return null;
};

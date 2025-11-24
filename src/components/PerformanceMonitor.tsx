/**
 * Performance Monitor Component
 * Wrapper component for performance tracking
 */

import { useEffect } from 'react';
import {
  getPerformanceMetrics,
  requestIdleCallback,
} from '@/lib/performanceOptimizer';
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

      // ✨ ENHANCEMENT: Proactive performance monitoring with auto-alerts
      if (metrics) {
        // Log in development
        if (import.meta.env.DEV) {
          logger.info('Performance Metrics', 'performanceMonitor', {
            'Time to First Byte': `${metrics.ttfb?.toFixed(2)}ms`,
            'DOM Content Loaded': `${metrics.domContentLoaded?.toFixed(2)}ms`,
            'Load Complete': `${metrics.loadComplete?.toFixed(2)}ms`,
            'First Paint': `${metrics.firstPaint?.toFixed(2)}ms`,
            'First Contentful Paint': `${metrics.firstContentfulPaint?.toFixed(2)}ms`,
          });
        }

        // ✨ ENHANCEMENT: Auto-detect performance issues and log
        const slowThresholds = {
          ttfb: 600,
          domContentLoaded: 1500,
          firstContentfulPaint: 1800,
        };

        const issues: string[] = [];
        if (metrics.ttfb && metrics.ttfb > slowThresholds.ttfb) {
          issues.push('Slow server response');
        }
        if (
          metrics.domContentLoaded &&
          metrics.domContentLoaded > slowThresholds.domContentLoaded
        ) {
          issues.push('Slow page load');
        }
        if (
          metrics.firstContentfulPaint &&
          metrics.firstContentfulPaint > slowThresholds.firstContentfulPaint
        ) {
          issues.push('Slow initial render');
        }

        // Auto-report performance issues to analytics
        if (issues.length > 0 && !import.meta.env.DEV) {
          logger.warn(
            'Performance degradation detected',
            'performanceMonitor',
            {
              issues,
              metrics: {
                ttfb: metrics.ttfb,
                fcp: metrics.firstContentfulPaint,
                dcl: metrics.domContentLoaded,
              },
            }
          );
        }
      }
    });
  };

  return null;
};

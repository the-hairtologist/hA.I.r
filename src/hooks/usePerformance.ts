/**
 * Unified Performance Tracking Hook
 * Consolidates performance monitoring, tracking, and timing utilities
 */

import { useEffect, useRef } from 'react';
import { customMetrics } from '@/lib/performance/customMetrics';
import { measurePerformance, getPerformanceMetrics } from '@/lib/performanceOptimizer';
import { logger } from '@/lib/logger';

interface PerformanceOptions {
  componentName: string;
  trackRenders?: boolean;
  trackMounts?: boolean;
  logToConsole?: boolean;
  reportThreshold?: number;
}

export const usePerformance = ({
  componentName,
  trackRenders = true,
  trackMounts = true,
  logToConsole = false,
  reportThreshold = 16,
}: PerformanceOptions) => {
  const renderCount = useRef(0);
  const mountTime = useRef<number>(0);
  const lastRenderTime = useRef(Date.now());

  // Track component mount/unmount
  useEffect(() => {
    if (trackMounts) {
      mountTime.current = performance.now();
      customMetrics.mark(`${componentName}-mount`);
      measurePerformance(`${componentName}-mount`);

      const loadTime = Date.now() - mountTime.current;
      if (loadTime > 100 && process.env.NODE_ENV === 'development') {
        logger.warn('Slow component mount detected', 'performance', {
          component: componentName,
          loadTime: `${loadTime}ms`
        });
      }

      return () => {
        const unmountTime = performance.now();
        const mountDuration = unmountTime - mountTime.current;
        measurePerformance(`${componentName}-unmount`);
        
        logger.debug('Component unmounted', 'performance', {
          component: componentName,
          duration: `${Math.round(mountDuration)}ms`
        });
      };
    }
  }, [componentName, trackMounts]);

  // Track renders
  useEffect(() => {
    if (trackRenders) {
      renderCount.current += 1;
      const now = Date.now();
      const renderTime = now - lastRenderTime.current;
      lastRenderTime.current = now;

      customMetrics.mark(`${componentName}-render-${renderCount.current}`);
      measurePerformance(`${componentName}-render-${renderCount.current}`);

      // Log slow renders
      if (renderTime > reportThreshold && logToConsole) {
        logger.warn('Slow component render detected', 'performance', {
          component: componentName,
          renderTime: `${renderTime}ms`,
          threshold: `${reportThreshold}ms`,
          renderNumber: renderCount.current
        });
      }

      // Warn about excessive renders
      if (process.env.NODE_ENV === 'development' && renderCount.current > 10) {
        logger.warn('Excessive renders detected', 'performance', {
          component: componentName,
          renderCount: renderCount.current
        });
      }

      // Log every 10th render in development
      if (logToConsole && renderCount.current % 10 === 0) {
        const metrics = getPerformanceMetrics();
        logger.debug('Component performance metrics', 'performance', {
          component: componentName,
          renders: renderCount.current,
          lastRenderTime: renderTime,
          ...metrics,
        });
      }
    }
  });

  return {
    renderCount: renderCount.current,
  };
};

/**
 * Hook to track async operations with performance metrics
 */
export const useAsyncTracking = (operationName: string) => {
  const trackAsync = async <T,>(operation: () => Promise<T>): Promise<T> => {
    return customMetrics.trackAsync(operationName, operation);
  };

  return { trackAsync };
};

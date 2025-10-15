/**
 * Unified Performance Tracking Hook
 * Consolidates performance monitoring, tracking, and timing utilities
 */

import { useEffect, useRef } from 'react';
import { customMetrics } from '@/lib/performance/customMetrics';
import { measurePerformance, getPerformanceMetrics } from '@/lib/performanceOptimizer';

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
        console.warn(`[Performance] ${componentName} slow mount: ${loadTime}ms`);
      }

      return () => {
        const unmountTime = performance.now();
        const mountDuration = unmountTime - mountTime.current;
        measurePerformance(`${componentName}-unmount`);
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`${componentName} was mounted for ${Math.round(mountDuration)}ms`);
        }
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
        console.warn(
          `[Performance] ${componentName} slow render:`,
          `${renderTime}ms (threshold: ${reportThreshold}ms)`,
          `Render #${renderCount.current}`
        );
      }

      // Warn about excessive renders
      if (process.env.NODE_ENV === 'development' && renderCount.current > 10) {
        console.warn(`⚠️ ${componentName} has rendered ${renderCount.current} times`);
      }

      // Log every 10th render in development
      if (logToConsole && renderCount.current % 10 === 0) {
        const metrics = getPerformanceMetrics();
        console.log(`[Performance] ${componentName} metrics:`, {
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

/**
 * Performance Tracking Hook
 * React hook for tracking component performance
 */

import { useEffect, useRef } from 'react';
import { customMetrics } from '@/lib/performance/customMetrics';

interface PerformanceTrackingOptions {
  componentName: string;
  trackRenders?: boolean;
  trackMounts?: boolean;
}

export const usePerformanceTracking = ({
  componentName,
  trackRenders = true,
  trackMounts = true,
}: PerformanceTrackingOptions) => {
  const renderCount = useRef(0);
  const mountTime = useRef<number>(0);

  // Track component mount
  useEffect(() => {
    if (trackMounts) {
      mountTime.current = performance.now();
      customMetrics.mark(`${componentName}-mount`);

      return () => {
        const unmountTime = performance.now();
        const mountDuration = unmountTime - mountTime.current;
        
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
      customMetrics.mark(`${componentName}-render-${renderCount.current}`);

      if (process.env.NODE_ENV === 'development' && renderCount.current > 10) {
        console.warn(`⚠️ ${componentName} has rendered ${renderCount.current} times`);
      }
    }
  });

  return {
    renderCount: renderCount.current,
  };
};

/**
 * Hook to track async operations
 */
export const useAsyncTracking = (operationName: string) => {
  const trackAsync = async <T,>(operation: () => Promise<T>): Promise<T> => {
    return customMetrics.trackAsync(operationName, operation);
  };

  return { trackAsync };
};

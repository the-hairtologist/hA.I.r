/**
 * Performance Monitoring Hook
 * Tracks and logs performance metrics
 */

import { useEffect, useRef } from 'react';
import { getPerformanceMetrics, measurePerformance } from '@/lib/performanceOptimizer';

interface PerformanceMonitorOptions {
  componentName: string;
  logToConsole?: boolean;
  reportThreshold?: number; // Report if render time exceeds this (ms)
}

export const usePerformanceMonitor = ({
  componentName,
  logToConsole = false,
  reportThreshold = 16, // 60fps = 16.67ms per frame
}: PerformanceMonitorOptions) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current += 1;
    const now = Date.now();
    const renderTime = now - lastRenderTime.current;
    lastRenderTime.current = now;

    // Mark performance
    measurePerformance(`${componentName}-render-${renderCount.current}`);

    // Log slow renders
    if (renderTime > reportThreshold && logToConsole) {
      console.warn(
        `[Performance] ${componentName} slow render:`,
        `${renderTime}ms (threshold: ${reportThreshold}ms)`,
        `Render #${renderCount.current}`
      );
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
  });

  return {
    renderCount: renderCount.current,
  };
};

// Hook to track component mount time
export const useComponentTiming = (componentName: string) => {
  const mountTime = useRef(Date.now());

  useEffect(() => {
    const loadTime = Date.now() - mountTime.current;
    measurePerformance(`${componentName}-mount`);
    
    if (loadTime > 100) {
      console.warn(
        `[Performance] ${componentName} slow mount: ${loadTime}ms`
      );
    }

    return () => {
      const unmountTime = Date.now();
      const totalTime = unmountTime - mountTime.current;
      measurePerformance(`${componentName}-unmount`);
      
      console.log(
        `[Performance] ${componentName} total time: ${totalTime}ms`
      );
    };
  }, [componentName]);
};

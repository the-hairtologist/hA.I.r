/**
 * Advanced React Performance Optimizations
 * Provides utilities for memoization, lazy loading, and render optimization
 */

import React, { ComponentType, lazy, memo, Suspense } from 'react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

/**
 * Enhanced lazy loading with preloading capability
 */
export function lazyWithPreload<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  const Component = lazy(factory);
  
  return Object.assign(Component, {
    preload: factory,
  });
}

/**
 * Lazy load with retry logic for failed chunks
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  retriesLeft = 3,
  interval = 1000
): React.LazyExoticComponent<T> {
  return lazy(() =>
    factory().catch((error) => {
      if (retriesLeft === 0) {
        throw error;
      }

      return new Promise<{ default: T }>((resolve, reject) => {
        setTimeout(() => {
          lazyWithRetry(factory, retriesLeft - 1, interval * 2);
          factory().then(resolve).catch(reject);
        }, interval);
      });
    })
  );
}

/**
 * HOC for automatic memoization with custom comparison
 */
export function withMemo<P extends object>(
  Component: ComponentType<P>,
  propsAreEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean
) {
  return memo(Component, propsAreEqual);
}

/**
 * Lazy component wrapper with loading fallback
 */
interface LazyComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const LazyWrapper = memo(({ children, fallback }: LazyComponentProps) => (
  <Suspense fallback={fallback || <LoadingSpinner />}>
    {children}
  </Suspense>
));

LazyWrapper.displayName = 'LazyWrapper';

/**
 * Preload critical resources
 */
export const preloadCriticalResources = () => {
  // Preload critical fonts
  const fontPreloads = [
    { href: '/fonts/inter-var.woff2', type: 'font/woff2' },
  ];

  fontPreloads.forEach(({ href, type }) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = type;
    link.crossOrigin = 'anonymous';
    link.href = href;
    document.head.appendChild(link);
  });
};

/**
 * Optimize images with intersection observer
 */
export const useLazyImage = (src: string, threshold = 0.1) => {
  const [imageSrc, setImageSrc] = React.useState<string>('');
  const [isLoaded, setIsLoaded] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement | null>(null);

  React.useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageSrc(src);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [src, threshold]);

  const onLoad = React.useCallback(() => {
    setIsLoaded(true);
  }, []);

  return { imgRef, imageSrc, isLoaded, onLoad };
};

/**
 * Optimize event handlers with debouncing
 */
export const useOptimizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay = 300
): ((...args: Parameters<T>) => void) => {
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  return React.useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
};

/**
 * Virtual scrolling hook for large lists
 */
export const useVirtualScroll = (
  itemCount: number,
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = React.useState(0);

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    itemCount,
    Math.ceil((scrollTop + containerHeight) / itemHeight)
  );

  const offsetY = visibleStart * itemHeight;

  const handleScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleRange: { start: visibleStart, end: visibleEnd },
    offsetY,
    totalHeight: itemCount * itemHeight,
    handleScroll,
  };
};

/**
 * Code splitting point marker for better organization
 */
export const createChunkBoundary = (name: string) => {
  return (Component: ComponentType<any>) => {
    Component.displayName = `ChunkBoundary(${name})`;
    return Component;
  };
};

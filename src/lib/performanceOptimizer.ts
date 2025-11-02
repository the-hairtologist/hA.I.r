/**
 * Performance Optimization Utilities
 * Cross-device performance enhancements
 */

// Debounce for performance-critical operations
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle for scroll/resize events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Lazy load images
export const observeImages = () => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });

    return () => imageObserver.disconnect();
  }
};

// Detect device capabilities
export const getDeviceCapabilities = () => {
  const isTouchDevice =
    'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const hasHover = window.matchMedia('(hover: hover)').matches;
  const pixelRatio = window.devicePixelRatio || 1;
  const isHighDensity = pixelRatio >= 2;

  // Detect device type
  const width = window.innerWidth;
  const deviceType =
    width < 640 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop';

  // Network info (if available)
  const connection = (navigator as any).connection;
  const isSlowConnection =
    connection?.effectiveType === 'slow-2g' ||
    connection?.effectiveType === '2g';

  return {
    isTouchDevice,
    hasHover,
    pixelRatio,
    isHighDensity,
    deviceType,
    isSlowConnection,
    width,
    height: window.innerHeight,
  };
};

// Optimize images based on device
export const getOptimizedImageUrl = (
  baseUrl: string,
  width: number,
  height?: number
): string => {
  const { pixelRatio, deviceType, isSlowConnection } = getDeviceCapabilities();

  // Reduce quality on slow connections
  const quality = isSlowConnection ? 70 : 85;

  // Adjust dimensions based on device
  let targetWidth = width;
  if (deviceType === 'mobile' && !isSlowConnection) {
    targetWidth = Math.min(width, 800);
  } else if (deviceType === 'tablet') {
    targetWidth = Math.min(width, 1200);
  }

  // Account for pixel ratio
  targetWidth = Math.round(targetWidth * Math.min(pixelRatio, 2));

  // Add query parameters for image optimization service
  const params = new URLSearchParams({
    w: targetWidth.toString(),
    q: quality.toString(),
    ...(height && { h: Math.round(height * pixelRatio).toString() }),
  });

  return `${baseUrl}?${params.toString()}`;
};

// Preload critical resources
export const preloadCriticalResources = (
  resources: Array<{ href: string; as: string }>
) => {
  resources.forEach(({ href, as }) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  });
};

// Monitor performance
export const measurePerformance = (mark: string) => {
  if ('performance' in window && 'mark' in performance) {
    performance.mark(mark);
  }
};

export const getPerformanceMetrics = () => {
  if ('performance' in window) {
    const navigation = performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming;

    return {
      // Time to First Byte
      ttfb: navigation?.responseStart - navigation?.requestStart,
      // DOM Content Loaded
      domContentLoaded:
        navigation?.domContentLoadedEventEnd -
        navigation?.domContentLoadedEventStart,
      // Load Complete
      loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart,
      // First Paint
      firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
      // First Contentful Paint
      firstContentfulPaint: performance.getEntriesByName(
        'first-contentful-paint'
      )[0]?.startTime,
    };
  }
  return null;
};

// Request Idle Callback polyfill
export const requestIdleCallback = (callback: IdleRequestCallback) => {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback);
  }
  return setTimeout(callback, 1);
};

// Viewport detection with caching
let cachedViewport: {
  width: number;
  height: number;
  orientation: string;
} | null = null;

export const getViewport = () => {
  if (
    cachedViewport &&
    cachedViewport.width === window.innerWidth &&
    cachedViewport.height === window.innerHeight
  ) {
    return cachedViewport;
  }

  cachedViewport = {
    width: window.innerWidth,
    height: window.innerHeight,
    orientation:
      window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
  };

  return cachedViewport;
};

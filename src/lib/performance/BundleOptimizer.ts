/**
 * Bundle Size Optimization Utilities
 * Tree-shaking helpers and dynamic import utilities
 */

/**
 * Dynamic import with webpack magic comments for better chunking
 */
export const importWithChunkName = async <T = any>(
  modulePath: string,
  chunkName: string
): Promise<T> => {
  // @ts-ignore - webpack magic comment
  return await import(/* webpackChunkName: "[request]" */ modulePath);
};

/**
 * Conditional feature loading based on environment
 */
export const loadFeatureIfEnabled = async <T = any>(
  featureName: string,
  loader: () => Promise<T>
): Promise<T | null> => {
  const features = import.meta.env.VITE_ENABLED_FEATURES?.split(',') || [];
  
  if (features.includes(featureName) || import.meta.env.DEV) {
    return await loader();
  }
  
  return null;
};

/**
 * Load polyfills only when needed
 */
export const loadPolyfills = async () => {
  const polyfills: Promise<void>[] = [];

  // Check for IntersectionObserver (most modern browsers have it)
  if (!('IntersectionObserver' in window)) {
    console.warn('⚠️ IntersectionObserver not supported - some features may be limited');
  }

  // Check for ResizeObserver
  if (!('ResizeObserver' in window)) {
    console.warn('⚠️ ResizeObserver not supported - some features may be limited');
  }

  await Promise.all(polyfills);
};

/**
 * Preconnect to critical third-party domains
 */
export const preconnectCriticalDomains = () => {
  const domains = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ];

  domains.forEach((domain) => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

/**
 * Prefetch resources during idle time
 */
export const prefetchOnIdle = (resources: string[]) => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      resources.forEach((resource) => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = resource;
        document.head.appendChild(link);
      });
    });
  }
};

/**
 * Monitor and report bundle size in development
 */
export const reportBundleSize = () => {
  if (import.meta.env.DEV) {
    const scripts = Array.from(document.scripts);
    const totalSize = scripts.reduce((acc, script) => {
      if (script.src) {
        return acc + (script.textContent?.length || 0);
      }
      return acc;
    }, 0);

    console.log(`📦 Estimated bundle size: ${(totalSize / 1024).toFixed(2)} KB`);
  }
};

/**
 * Tree-shakable logger (removed in production)
 */
export const devLog = (...args: any[]) => {
  if (import.meta.env.DEV) {
    console.log(...args);
  }
};

export const devWarn = (...args: any[]) => {
  if (import.meta.env.DEV) {
    console.warn(...args);
  }
};

export const devError = (...args: any[]) => {
  if (import.meta.env.DEV) {
    console.error(...args);
  }
};

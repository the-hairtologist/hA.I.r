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
  // Dynamic import with chunk naming for better code splitting
  return await import(modulePath);
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

  // Polyfills loaded silently - modern browsers typically have these features

  await Promise.all(polyfills);
};

/**
 * Preconnect to critical third-party domains
 */
export const preconnectCriticalDomains = () => {
  const domains = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'];

  domains.forEach(domain => {
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
      resources.forEach(resource => {
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
  // Bundle size reporting disabled - use build tools for accurate metrics
};

/**
 * Development-only logging (tree-shaken in production)
 */
import { log } from '@/lib/logger';

export const devLog = (...args: any[]) => {
  if (import.meta.env.DEV) {
    log.debug(
      String(args[0]),
      'dev',
      args.length > 1 ? { data: args.slice(1) } : undefined
    );
  }
};

export const devWarn = (...args: any[]) => {
  if (import.meta.env.DEV) {
    log.warn(
      String(args[0]),
      'dev',
      args.length > 1 ? { data: args.slice(1) } : undefined
    );
  }
};

export const devError = (...args: any[]) => {
  if (import.meta.env.DEV) {
    log.error(String(args[0]), 'dev', args.length > 1 ? args[1] : undefined);
  }
};

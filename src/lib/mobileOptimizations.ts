/**
 * Mobile Optimization Utilities
 * Ensures smooth performance and native-like feel on mobile devices
 */

// Import Platform using ESM
import { Platform } from '@/platform';

/**
 * Prevent elastic scrolling on iOS (prevents bounce effect)
 */
export const preventElasticScroll = () => {
  if (Platform.isIOS) {
    document.body.style.overscrollBehavior = 'none';
  }
};

/**
 * Enable smooth scrolling with momentum
 */
export const enableSmoothScrolling = () => {
  if (Platform.isMobile) {
    const style = document.documentElement.style as CSSStyleDeclaration & { webkitOverflowScrolling?: string };
    style.webkitOverflowScrolling = 'touch';
  }
};

/**
 * Ensure zoom is enabled (for accessibility)
 */
export const ensureZoomEnabled = () => {
  const viewportMeta = document.querySelector('meta[name="viewport"]');
  if (viewportMeta) {
    viewportMeta.setAttribute(
      'content',
      'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover'
    );
  }
};

/**
 * Optimize images for device pixel ratio
 */
export const getOptimizedImageSrc = (baseSrc: string, pixelRatio: number = window.devicePixelRatio) => {
  if (pixelRatio >= 3) return baseSrc.replace(/\.(jpg|png)$/, '@3x.$1');
  if (pixelRatio >= 2) return baseSrc.replace(/\.(jpg|png)$/, '@2x.$1');
  return baseSrc;
};

/**
 * Detect slow connection and adjust quality
 */
export const isSlowConnection = (): boolean => {
  type NetworkConnection = {
    effectiveType?: string;
    saveData?: boolean;
  };
  const connection = (navigator as unknown as { connection?: NetworkConnection; mozConnection?: NetworkConnection; webkitConnection?: NetworkConnection }).connection || 
                     (navigator as unknown as { mozConnection?: NetworkConnection }).mozConnection || 
                     (navigator as unknown as { webkitConnection?: NetworkConnection }).webkitConnection;
  if (!connection) return false;
  
  return (
    connection.effectiveType === 'slow-2g' ||
    connection.effectiveType === '2g' ||
    connection.saveData === true
  );
};

/**
 * Prefetch critical routes for faster navigation
 */
export const prefetchRoutes = (routes: string[]) => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      routes.forEach(route => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = route;
        document.head.appendChild(link);
      });
    });
  }
};

/**
 * Initialize all mobile optimizations
 * Call this in your main App component
 */
export const initMobileOptimizations = () => {
  if (!Platform.isMobile) return;

  preventElasticScroll();
  enableSmoothScrolling();
  
  // Prefetch common routes
  prefetchRoutes([
    '/dashboard',
    '/appointments',
    '/clients',
    '/messages',
  ]);

  // Set appropriate status bar
  if (Platform.isIOS) {
    document.documentElement.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)');
    document.documentElement.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');
  }
};

/**
 * Handle input focus to prevent zoom issues
 */
export const setupInputHandlers = () => {
  if (!Platform.isMobile) return;

  document.addEventListener('focusin', (e) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      // Ensure zoom is enabled for accessibility
      ensureZoomEnabled();
    }
  });
};

/**
 * Detect if app is running in standalone mode (installed PWA)
 */
export const isStandalone = (): boolean => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true ||
    document.referrer.includes('android-app://')
  );
};

/**
 * Get device-appropriate image size
 */
export const getImageSize = (size: 'thumbnail' | 'medium' | 'large'): number => {
  const baseSize = {
    thumbnail: 150,
    medium: 500,
    large: 1200,
  }[size];

  const pixelRatio = Math.min(window.devicePixelRatio, 3); // Cap at 3x
  return Math.round(baseSize * pixelRatio);
};

/**
 * Optimize animations for device capability
 */
export const getAnimationDuration = (baseDuration: number): number => {
  // Reduce animation duration on low-end devices
  const isLowEnd = isSlowConnection() || window.devicePixelRatio < 2;
  return isLowEnd ? baseDuration * 0.7 : baseDuration;
};

export const mobileOptimizations = {
  preventElasticScroll,
  enableSmoothScrolling,
  ensureZoomEnabled,
  getOptimizedImageSrc,
  isSlowConnection,
  prefetchRoutes,
  initMobileOptimizations,
  setupInputHandlers,
  isStandalone,
  getImageSize,
  getAnimationDuration,
} as const;

export default mobileOptimizations;

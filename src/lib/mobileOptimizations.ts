/**
 * Mobile Optimization Utilities
 * Ensures smooth performance and native-like feel on mobile devices
 */

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
    (document.documentElement.style as any).webkitOverflowScrolling = 'touch';
  }
};

/**
 * Prevent zoom on input focus (mobile) - DEPRECATED
 * Note: This function is kept for backwards compatibility but should not be used
 * as it impacts accessibility. Modern browsers handle input zoom appropriately.
 */
export const preventInputZoom = () => {
  // DEPRECATED: Disabling zoom hurts accessibility
  // Modern mobile browsers handle input zoom intelligently
  console.warn('preventInputZoom is deprecated and should not be used for accessibility reasons');
};

/**
 * Re-enable zoom (call when input loses focus)
 */
export const enableZoom = () => {
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
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
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
      // Allow zoom for better accessibility
      enableZoom();
    }
  });

  document.addEventListener('focusout', (e) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      // Keep zoom enabled for accessibility
      // Only disable if specifically needed
    }
  });
};

/**
 * Detect if app is running in standalone mode (installed PWA)
 */
export const isStandalone = (): boolean => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
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
  preventInputZoom,
  enableZoom,
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

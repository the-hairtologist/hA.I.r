/**
 * Comprehensive Mobile Optimization Utilities
 * Enhanced mobile enhancements with Cloud integration
 */

import { triggerHaptic, isLowEndDevice, setupViewportHeightFix, getOptimizedImageSize } from './mobileEnhancements';

export { triggerHaptic, isLowEndDevice, setupViewportHeightFix, getOptimizedImageSize };

/**
 * Check if device has slow connection
 */
export function isSlowConnection(): boolean {
  if (typeof window === 'undefined') return false;
  
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  if (!connection) return false;
  
  return ['2g', 'slow-2g'].includes(connection.effectiveType) || connection.saveData === true;
}

/**
 * Get optimized animation duration based on device capability and user preference
 */
export function getAnimationDuration(baseMs: number, reduceAnimations: boolean = false): number {
  if (reduceAnimations || isLowEndDevice()) {
    return Math.min(baseMs * 0.5, 150); // Max 150ms for reduced motion
  }
  return baseMs;
}

/**
 * Validate touch target meets WCAG 2.1 minimum (44x44px)
 */
export function validateTouchTarget(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  const MIN_SIZE = 44;
  return rect.width >= MIN_SIZE && rect.height >= MIN_SIZE;
}

/**
 * Get safe area insets from CSS
 */
export function getSafeAreaInsets() {
  if (typeof window === 'undefined') return { top: 0, bottom: 0, left: 0, right: 0 };
  
  const style = getComputedStyle(document.documentElement);
  return {
    top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0'),
    bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
    left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0'),
    right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0'),
  };
}

/**
 * Setup comprehensive mobile optimizations
 */
export function initCompleteMobileOptimization(options: {
  hapticEnabled?: boolean;
  reduceAnimations?: boolean;
  offlineMode?: boolean;
} = {}) {
  // Viewport height fix
  setupViewportHeightFix();
  
  // Animation optimization
  if (options.reduceAnimations || isLowEndDevice()) {
    document.documentElement.style.setProperty('--animation-duration', '0.1s');
    document.documentElement.style.setProperty('--transition-duration', '0.1s');
  }
  
  // Prevent horizontal scroll
  document.documentElement.style.overflowX = 'hidden';
  document.body.style.overflowX = 'hidden';
  
  // Setup safe area insets
  const root = document.documentElement;
  root.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top, 0px)');
  root.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom, 0px)');
  root.style.setProperty('--safe-area-inset-left', 'env(safe-area-inset-left, 0px)');
  root.style.setProperty('--safe-area-inset-right', 'env(safe-area-inset-right, 0px)');
}

export default {
  triggerHaptic,
  isLowEndDevice,
  isSlowConnection,
  getAnimationDuration,
  validateTouchTarget,
  getSafeAreaInsets,
  getOptimizedImageSize,
  setupViewportHeightFix,
  initCompleteMobileOptimization,
};
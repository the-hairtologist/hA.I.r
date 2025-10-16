/**
 * Mobile Enhancement Layer
 * Additional optimizations beyond base mobile support
 */

/**
 * Detect if device is low-end based on multiple factors
 */
export function isLowEndDevice(): boolean {
  if (typeof window === 'undefined') return false;

  // Check device memory (if available)
  const memory = (navigator as any).deviceMemory;
  if (memory && memory < 4) return true;

  // Check hardware concurrency (CPU cores)
  const cores = navigator.hardwareConcurrency;
  if (cores && cores < 4) return true;

  // Check connection speed
  const connection = (navigator as any).connection;
  if (connection?.effectiveType && ['2g', 'slow-2g'].includes(connection.effectiveType)) {
    return true;
  }

  return false;
}

/**
 * Optimize animations for device capability
 */
export function optimizeAnimations(): void {
  if (typeof window === 'undefined') return;

  const isLowEnd = isLowEndDevice();
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (isLowEnd || prefersReducedMotion) {
    document.documentElement.style.setProperty('--animation-duration', '0.1s');
    document.documentElement.style.setProperty('--transition-duration', '0.1s');
  }
}

/**
 * Add safe area insets for notched devices
 */
export function setupSafeAreaInsets(): void {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;
  
  // iOS safe area insets
  root.style.setProperty('padding-top', 'env(safe-area-inset-top)');
  root.style.setProperty('padding-bottom', 'env(safe-area-inset-bottom)');
  root.style.setProperty('padding-left', 'env(safe-area-inset-left)');
  root.style.setProperty('padding-right', 'env(safe-area-inset-right)');
}

/**
 * Optimize touch target sizes (WCAG 2.1 - 44x44px minimum)
 */
export function validateTouchTargets(): void {
  if (typeof window === 'undefined') return;
  if (!('ontouchstart' in window)) return;

  const MIN_SIZE = 44; // WCAG 2.1 requirement
  const interactiveElements = document.querySelectorAll('button, a[href], input, select, textarea');

  interactiveElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.width < MIN_SIZE || rect.height < MIN_SIZE) {
      console.warn('Touch target too small:', {
        element: el.tagName,
        size: `${rect.width}x${rect.height}`,
        minimum: MIN_SIZE
      });
    }
  });
}

/**
 * Setup haptic feedback for actions (Capacitor only)
 */
export async function triggerHaptic(type: 'light' | 'medium' | 'heavy' = 'medium'): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    // Check if Capacitor Haptics is available
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    
    switch (type) {
      case 'light':
        await Haptics.impact({ style: ImpactStyle.Light });
        break;
      case 'medium':
        await Haptics.impact({ style: ImpactStyle.Medium });
        break;
      case 'heavy':
        await Haptics.impact({ style: ImpactStyle.Heavy });
        break;
    }
  } catch {
    // Haptics not available (web), fallback to vibration API
    if (navigator.vibrate) {
      const duration = type === 'light' ? 10 : type === 'medium' ? 20 : 30;
      navigator.vibrate(duration);
    }
  }
}

/**
 * Detect and handle network quality changes
 */
export function setupNetworkMonitoring(onSlowConnection: () => void): void {
  if (typeof window === 'undefined') return;

  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  if (!connection) return;

  const checkConnection = () => {
    const effectiveType = connection.effectiveType;
    if (['2g', 'slow-2g'].includes(effectiveType)) {
      onSlowConnection();
    }
  };

  connection.addEventListener('change', checkConnection);
  checkConnection(); // Initial check
}

/**
 * Optimize images for device pixel ratio
 */
export function getOptimizedImageSize(baseSize: number): number {
  if (typeof window === 'undefined') return baseSize;
  
  const dpr = window.devicePixelRatio || 1;
  
  // Cap at 2x for very high DPR devices (diminishing returns)
  const effectiveDPR = Math.min(dpr, 2);
  
  return Math.round(baseSize * effectiveDPR);
}

/**
 * Detect if running as PWA
 */
export function isPWA(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

/**
 * Setup viewport height fix for mobile browsers (addresses URL bar)
 */
export function setupViewportHeightFix(): void {
  if (typeof window === 'undefined') return;

  const setVH = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  setVH();
  window.addEventListener('resize', setVH);
  window.addEventListener('orientationchange', setVH);
}

/**
 * Initialize all mobile enhancements
 */
export function initMobileEnhancements(): void {
  optimizeAnimations();
  setupSafeAreaInsets();
  setupViewportHeightFix();
  
  // Run touch target validation in development
  if (import.meta.env.DEV) {
    setTimeout(validateTouchTargets, 1000);
  }
}
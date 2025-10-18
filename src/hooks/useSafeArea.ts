/**
 * Safe Area Hook
 * Centralized safe area utilities for iOS notch, Dynamic Island, and Android punch-holes
 */

import { useEffect, useState } from 'react';
import { Platform } from '@/platform/detector';

interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export const useSafeArea = () => {
  const [insets, setInsets] = useState<SafeAreaInsets>({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });

  useEffect(() => {
    const updateInsets = () => {
      if (typeof window === 'undefined') return;

      // Get CSS environment variables for safe areas
      const computedStyle = getComputedStyle(document.documentElement);
      
      setInsets({
        top: parseInt(computedStyle.getPropertyValue('--safe-area-inset-top') || '0'),
        bottom: parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0'),
        left: parseInt(computedStyle.getPropertyValue('--safe-area-inset-left') || '0'),
        right: parseInt(computedStyle.getPropertyValue('--safe-area-inset-right') || '0'),
      });
    };

    updateInsets();
    
    // Update on orientation change
    window.addEventListener('resize', updateInsets);
    window.addEventListener('orientationchange', updateInsets);

    return () => {
      window.removeEventListener('resize', updateInsets);
      window.removeEventListener('orientationchange', updateInsets);
    };
  }, []);

  return {
    insets,
    // Tailwind-compatible classes
    classes: {
      top: 'pt-safe-top',
      bottom: 'pb-safe-bottom',
      left: 'pl-safe-left',
      right: 'pr-safe-right',
      all: 'p-safe',
    },
    // Inline style values
    styles: {
      paddingTop: `max(${insets.top}px, 16px)`,
      paddingBottom: `max(${insets.bottom}px, 16px)`,
      paddingLeft: `max(${insets.left}px, 16px)`,
      paddingRight: `max(${insets.right}px, 16px)`,
    },
    // Check if device has safe areas
    hasSafeArea: insets.top > 0 || insets.bottom > 0,
    // Platform-specific checks
    hasNotch: Platform.isIOS && insets.top > 20,
    hasHomeIndicator: Platform.isIOS && insets.bottom > 0,
  };
};

/**
 * Hook specifically for bottom navigation safe area
 * Ensures navigation buttons are never obscured by iOS home indicator
 */
export const useBottomNavSafeArea = () => {
  const { insets } = useSafeArea();
  
  return {
    paddingBottom: Math.max(insets.bottom, 16), // Minimum 16px padding
    className: 'pb-safe-bottom',
    style: {
      paddingBottom: `max(env(safe-area-inset-bottom), 16px)`,
    },
  };
};

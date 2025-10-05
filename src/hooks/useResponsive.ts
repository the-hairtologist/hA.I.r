/**
 * Comprehensive Responsive Hook
 * Handles device detection, breakpoints, and orientation
 */

import { useState, useEffect } from 'react';
import { throttle } from '@/lib/performanceOptimizer';

interface ResponsiveState {
  // Device type
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  
  // Specific breakpoints
  isXs: boolean;
  isSm: boolean;
  isMd: boolean;
  isLg: boolean;
  isXl: boolean;
  is2Xl: boolean;
  
  // Device capabilities
  isTouchDevice: boolean;
  hasHover: boolean;
  
  // Orientation
  isPortrait: boolean;
  isLandscape: boolean;
  
  // Dimensions
  width: number;
  height: number;
  
  // Pixel density
  pixelRatio: number;
  isRetina: boolean;
}

const BREAKPOINTS = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export const useResponsive = (): ResponsiveState => {
  const getResponsiveState = (): ResponsiveState => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const pixelRatio = window.devicePixelRatio || 1;
    
    return {
      // Device type
      isMobile: width < BREAKPOINTS.md,
      isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
      isDesktop: width >= BREAKPOINTS.lg,
      
      // Specific breakpoints
      isXs: width >= BREAKPOINTS.xs,
      isSm: width >= BREAKPOINTS.sm,
      isMd: width >= BREAKPOINTS.md,
      isLg: width >= BREAKPOINTS.lg,
      isXl: width >= BREAKPOINTS.xl,
      is2Xl: width >= BREAKPOINTS['2xl'],
      
      // Device capabilities
      isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      hasHover: window.matchMedia('(hover: hover)').matches,
      
      // Orientation
      isPortrait: height > width,
      isLandscape: width > height,
      
      // Dimensions
      width,
      height,
      
      // Pixel density
      pixelRatio,
      isRetina: pixelRatio >= 2,
    };
  };

  const [state, setState] = useState<ResponsiveState>(getResponsiveState);

  useEffect(() => {
    const handleResize = throttle(() => {
      setState(getResponsiveState());
    }, 150);

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return state;
};

// Hook for specific breakpoint
export const useBreakpoint = (breakpoint: keyof typeof BREAKPOINTS): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const query = `(min-width: ${BREAKPOINTS[breakpoint]}px)`;
    const media = window.matchMedia(query);
    
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [breakpoint]);

  return matches;
};

// Hook for orientation
export const useOrientation = (): 'portrait' | 'landscape' => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
  );

  useEffect(() => {
    const handleOrientationChange = throttle(() => {
      setOrientation(
        window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      );
    }, 150);

    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return orientation;
};

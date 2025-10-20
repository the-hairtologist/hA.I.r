/**
 * Responsive React Hooks
 */

import { useState, useEffect } from 'react';
import { BREAKPOINTS, Breakpoint } from './constants';

/**
 * Get current breakpoint
 */
export const useBreakpoint = (): Breakpoint => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('lg');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      
      if (width >= BREAKPOINTS['2xl']) setBreakpoint('2xl');
      else if (width >= BREAKPOINTS.xl) setBreakpoint('xl');
      else if (width >= BREAKPOINTS.lg) setBreakpoint('lg');
      else if (width >= BREAKPOINTS.md) setBreakpoint('md');
      else if (width >= BREAKPOINTS.sm) setBreakpoint('sm');
      else setBreakpoint('xs');
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return breakpoint;
};

/**
 * Check if current viewport is mobile
 */
export const useIsMobile = (): boolean => {
  const breakpoint = useBreakpoint();
  return breakpoint === 'xs' || breakpoint === 'sm';
};

/**
 * Check if current viewport is tablet
 */
export const useIsTablet = (): boolean => {
  const breakpoint = useBreakpoint();
  return breakpoint === 'md';
};

/**
 * Check if current viewport is desktop
 */
export const useIsDesktop = (): boolean => {
  const breakpoint = useBreakpoint();
  return breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl';
};

/**
 * Get responsive grid column count
 */
export const useResponsiveGrid = (config: {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}): number => {
  const breakpoint = useBreakpoint();
  
  const defaultConfig = {
    xs: 1,
    sm: 2,
    md: 2,
    lg: 3,
    xl: 4,
  };

  const merged = { ...defaultConfig, ...config };

  switch (breakpoint) {
    case 'xs': return merged.xs;
    case 'sm': return merged.sm;
    case 'md': return merged.md;
    case 'lg': return merged.lg;
    case 'xl':
    case '2xl': return merged.xl;
    default: return merged.lg;
  }
};

/**
 * Get platform-appropriate spacing
 */
export const useResponsiveSpacing = () => {
  const isMobile = useIsMobile();
  
  return {
    padding: isMobile ? 'p-4' : 'p-6',
    gap: isMobile ? 'gap-4' : 'gap-6',
    containerWidth: isMobile ? 'max-w-full' : 'max-w-7xl',
  };
};

/**
 * Check if specific breakpoint matches
 */
export const useMatchBreakpoint = (breakpoint: Breakpoint): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(min-width: ${BREAKPOINTS[breakpoint]}px)`);
    
    const handleChange = () => setMatches(mediaQuery.matches);
    handleChange();

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [breakpoint]);

  return matches;
};

/**
 * Get device orientation
 */
export const useOrientation = (): 'portrait' | 'landscape' => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
  );

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return orientation;
};

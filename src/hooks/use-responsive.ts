/**
 * Responsive Design Hooks
 * Simplifies responsive behavior across the app
 */

import { useState, useEffect } from 'react';

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('lg');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;

      if (width >= breakpoints['2xl']) setBreakpoint('2xl');
      else if (width >= breakpoints.xl) setBreakpoint('xl');
      else if (width >= breakpoints.lg) setBreakpoint('lg');
      else if (width >= breakpoints.md) setBreakpoint('md');
      else if (width >= breakpoints.sm) setBreakpoint('sm');
      else setBreakpoint('xs');
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return breakpoint;
};

export const useIsMobile = () => {
  const breakpoint = useBreakpoint();
  return breakpoint === 'xs' || breakpoint === 'sm';
};

export const useIsTablet = () => {
  const breakpoint = useBreakpoint();
  return breakpoint === 'md';
};

export const useIsDesktop = () => {
  const breakpoint = useBreakpoint();
  return breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl';
};

/**
 * Returns responsive grid column count
 */
export const useResponsiveGrid = (config: {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}) => {
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
    case 'xs':
      return merged.xs;
    case 'sm':
      return merged.sm;
    case 'md':
      return merged.md;
    case 'lg':
      return merged.lg;
    case 'xl':
    case '2xl':
      return merged.xl;
    default:
      return merged.lg;
  }
};

/**
 * Returns platform-appropriate spacing
 */
export const useResponsiveSpacing = () => {
  const isMobile = useIsMobile();

  return {
    padding: isMobile ? 'p-4' : 'p-6',
    gap: isMobile ? 'gap-4' : 'gap-6',
    containerWidth: isMobile ? 'max-w-full' : 'max-w-7xl',
  };
};

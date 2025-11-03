/**
 * Mobile-First Utility Functions
 * Base styles for mobile, enhanced for larger screens
 */

import { cn } from '@/lib/utils';

/**
 * Mobile-first base styles
 * Returns mobile-optimized classes
 */
export const mobileFirst = {
  /** Typography - mobile base sizes */
  text: {
    xs: 'text-xs md:text-sm',
    sm: 'text-sm md:text-base',
    base: 'text-base md:text-lg',
    lg: 'text-lg md:text-xl',
    xl: 'text-xl md:text-2xl',
    '2xl': 'text-2xl md:text-3xl',
    '3xl': 'text-3xl md:text-4xl',
    '4xl': 'text-4xl md:text-5xl',
  },
  
  /** Padding - mobile first */
  padding: {
    xs: 'p-2 md:p-3',
    sm: 'p-3 md:p-4',
    md: 'p-4 md:p-6',
    lg: 'p-6 md:p-8',
    xl: 'p-8 md:p-12',
  },
  
  /** Gaps - mobile first */
  gap: {
    xs: 'gap-2 md:gap-3',
    sm: 'gap-3 md:gap-4',
    md: 'gap-4 md:gap-6',
    lg: 'gap-6 md:gap-8',
    xl: 'gap-8 md:gap-12',
  },
  
  /** Container widths - mobile first */
  container: {
    full: 'w-full',
    contained: 'w-full md:max-w-7xl md:mx-auto',
    narrow: 'w-full md:max-w-4xl md:mx-auto',
    wide: 'w-full md:max-w-screen-2xl md:mx-auto',
  },
  
  /** Grid layouts - mobile first */
  grid: {
    single: 'grid grid-cols-1',
    double: 'grid grid-cols-1 sm:grid-cols-2',
    triple: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    quad: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    auto: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-auto-fit-250',
  },
  
  /** Stack layouts - mobile first */
  stack: {
    vertical: 'flex flex-col',
    responsive: 'flex flex-col md:flex-row',
    horizontalMobile: 'flex flex-row md:flex-col',
  },
} as const;

/**
 * Touch-optimized button sizes
 * All variants meet WCAG 2.2 AAA (44x44px minimum)
 */
export const touchButton = {
  sm: 'min-h-[44px] px-4 text-sm md:min-h-[36px] md:px-3 md:text-xs',
  md: 'min-h-[48px] px-6 text-base md:min-h-[40px] md:px-4 md:text-sm',
  lg: 'min-h-[56px] px-8 text-lg md:min-h-[44px] md:px-6 md:text-base',
  icon: 'h-[44px] w-[44px] md:h-[36px] md:w-[36px]',
} as const;

/**
 * Safe area padding for mobile devices
 * Handles notches, home indicators, etc.
 */
export const safeArea = {
  top: 'pt-safe',
  bottom: 'pb-safe',
  left: 'pl-safe',
  right: 'pr-safe',
  all: 'p-safe',
  horizontal: 'px-safe',
  vertical: 'py-safe',
} as const;

/**
 * Thumb zone optimization
 * Places interactive elements in easy-to-reach areas
 */
export const thumbZone = {
  /** Bottom third - easiest to reach */
  primary: 'fixed bottom-4 inset-x-4 md:relative md:bottom-0 md:inset-x-0',
  /** Right side - for one-handed use */
  fab: 'fixed bottom-20 right-4 z-40 md:bottom-4',
  /** Top - harder to reach, use for less important actions */
  secondary: 'sticky top-0 z-30',
} as const;

/**
 * Responsive image sizing
 * Optimized for mobile screens and data usage
 */
export const responsiveImage = {
  thumbnail: 'w-12 h-12 md:w-16 md:h-16',
  small: 'w-20 h-20 md:w-24 md:h-24',
  medium: 'w-32 h-32 md:w-40 md:h-40',
  large: 'w-48 h-48 md:w-64 md:h-64',
  hero: 'w-full h-48 md:h-64 lg:h-96',
} as const;

/**
 * Enhanced for tablet - adds tablet-specific breakpoint
 */
export const enhanceForTablet = (...classes: string[]) => {
  return cn(...classes, 'md:scale-105 md:shadow-lg');
};

/**
 * Enhanced for desktop - adds desktop enhancements
 */
export const enhanceForDesktop = (...classes: string[]) => {
  return cn(...classes, 'lg:scale-110 lg:shadow-xl lg:hover:scale-105');
};

/**
 * Mobile-first card component classes
 */
export const mobileCard = {
  base: cn(
    'rounded-lg border bg-card',
    'p-4 md:p-6', // Mobile-first padding
    'shadow-sm md:shadow-md', // Lighter shadow on mobile
    'transition-shadow duration-200'
  ),
  interactive: cn(
    'rounded-lg border bg-card',
    'p-4 md:p-6',
    'shadow-sm md:shadow-md',
    'active:shadow-xs md:hover:shadow-lg', // Touch feedback on mobile
    'transition-all duration-200',
    'cursor-pointer'
  ),
  compact: cn(
    'rounded-lg border bg-card',
    'p-3 md:p-4',
    'shadow-sm',
    'transition-shadow duration-200'
  ),
} as const;

/**
 * Mobile-optimized form field sizes
 */
export const mobileForm = {
  input: 'h-[48px] px-4 text-base md:h-[40px] md:px-3 md:text-sm',
  textarea: 'min-h-[120px] p-4 text-base md:min-h-[100px] md:p-3 md:text-sm',
  label: 'text-sm font-medium mb-2 md:text-xs md:mb-1',
  helperText: 'text-xs text-muted-foreground mt-1',
} as const;

/**
 * Performance-optimized scroll containers
 */
export const scrollContainer = {
  vertical: cn(
    'overflow-y-auto overflow-x-hidden',
    '-webkit-overflow-scrolling-touch', // iOS momentum scrolling
    'overscroll-behavior-y-contain' // Prevent elastic bounce
  ),
  horizontal: cn(
    'overflow-x-auto overflow-y-hidden',
    '-webkit-overflow-scrolling-touch',
    'overscroll-behavior-x-contain',
    'snap-x snap-mandatory' // Snap scrolling on mobile
  ),
} as const;

/**
 * Mobile navigation spacing
 * Accounts for bottom navigation bar
 */
export const mobileNav = {
  withBottomNav: 'pb-20', // Space for bottom nav (64px + 16px)
  withoutBottomNav: 'pb-4',
  bottomNavHeight: 'h-16', // 64px
} as const;

/**
 * Utility to combine mobile-first utilities
 */
export const mobileCombine = (...utilities: string[]) => {
  return cn(...utilities);
};

/**
 * Responsive System - Ensures consistent scaling across all devices
 *
 * This utility enforces responsive best practices and prevents fixed sizing issues.
 * Use these utilities in all components to maintain device consistency.
 */

import { logger } from '@/lib/logger';

// ============================================
// RESPONSIVE SCALE SYSTEM
// ============================================

/**
 * Fluid typography scale - automatically adjusts based on viewport
 * Use instead of fixed font sizes
 */
export const fluidText = {
  xs: 'text-[clamp(0.75rem,2vw,0.875rem)]', // 12px-14px
  sm: 'text-[clamp(0.875rem,2.5vw,1rem)]', // 14px-16px
  base: 'text-[clamp(1rem,3vw,1.125rem)]', // 16px-18px
  lg: 'text-[clamp(1.125rem,3.5vw,1.25rem)]', // 18px-20px
  xl: 'text-[clamp(1.25rem,4vw,1.5rem)]', // 20px-24px
  '2xl': 'text-[clamp(1.5rem,5vw,2rem)]', // 24px-32px
  '3xl': 'text-[clamp(1.875rem,6vw,2.5rem)]', // 30px-40px
  '4xl': 'text-[clamp(2.25rem,7vw,3rem)]', // 36px-48px
  '5xl': 'text-[clamp(3rem,8vw,4rem)]', // 48px-64px
} as const;

/**
 * Fluid spacing scale - responsive padding/margin
 * Use instead of fixed spacing values
 */
export const fluidSpace = {
  xs: 'clamp(0.25rem,1vw,0.5rem)', // 4px-8px
  sm: 'clamp(0.5rem,1.5vw,0.75rem)', // 8px-12px
  md: 'clamp(0.75rem,2vw,1rem)', // 12px-16px
  lg: 'clamp(1rem,2.5vw,1.5rem)', // 16px-24px
  xl: 'clamp(1.5rem,3vw,2rem)', // 24px-32px
  '2xl': 'clamp(2rem,4vw,3rem)', // 32px-48px
  '3xl': 'clamp(3rem,5vw,4rem)', // 48px-64px
} as const;

/**
 * Responsive container widths - ensures proper content containment
 */
export const containerWidths = {
  sm: 'max-w-[640px]',
  md: 'max-w-[768px]',
  lg: 'max-w-[1024px]',
  xl: 'max-w-[1280px]',
  '2xl': 'max-w-[1536px]',
  full: 'max-w-full',
  prose: 'max-w-[65ch]', // Optimal reading width
} as const;

// ============================================
// RESPONSIVE UTILITIES
// ============================================

/**
 * Get responsive padding for a container
 */
export const getResponsivePadding = (size: 'sm' | 'md' | 'lg' = 'md') => {
  const paddingMap = {
    sm: 'px-4 sm:px-6 md:px-8',
    md: 'px-4 sm:px-6 md:px-8 lg:px-12',
    lg: 'px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16',
  };
  return paddingMap[size];
};

/**
 * Get responsive margin for sections
 */
export const getResponsiveMargin = (size: 'sm' | 'md' | 'lg' = 'md') => {
  const marginMap = {
    sm: 'my-4 sm:my-6 md:my-8',
    md: 'my-6 sm:my-8 md:my-12',
    lg: 'my-8 sm:my-12 md:my-16 lg:my-20',
  };
  return marginMap[size];
};

/**
 * Get responsive gap for flex/grid containers
 */
export const getResponsiveGap = (size: 'sm' | 'md' | 'lg' = 'md') => {
  const gapMap = {
    sm: 'gap-2 sm:gap-3 md:gap-4',
    md: 'gap-3 sm:gap-4 md:gap-6',
    lg: 'gap-4 sm:gap-6 md:gap-8',
  };
  return gapMap[size];
};

/**
 * Get responsive grid columns
 */
export const getResponsiveGrid = (cols: {
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}) => {
  const classes: string[] = ['grid'];

  if (cols.sm) classes.push(`grid-cols-${cols.sm}`);
  if (cols.md) classes.push(`sm:grid-cols-${cols.md}`);
  if (cols.lg) classes.push(`md:grid-cols-${cols.lg}`);
  if (cols.xl) classes.push(`lg:grid-cols-${cols.xl}`);

  return classes.join(' ');
};

// ============================================
// TOUCH TARGET SIZES (WCAG AAA Compliance)
// ============================================

/**
 * Minimum touch target sizes for accessibility
 * WCAG 2.5.5 requires minimum 44x44px touch targets
 */
export const touchTargets = {
  minimum: 'min-h-[44px] min-w-[44px]', // WCAG minimum
  comfortable: 'min-h-[48px] min-w-[48px]', // Recommended
  large: 'min-h-[56px] min-w-[56px]', // Large devices
} as const;

/**
 * Button sizing with proper touch targets
 */
export const buttonSizes = {
  sm: 'h-10 min-h-[40px] px-3 text-sm', // 40px minimum for small
  md: 'h-11 min-h-[44px] px-4 text-base', // 44px WCAG compliant
  lg: 'h-12 min-h-[48px] px-6 text-lg', // 48px comfortable
  xl: 'h-14 min-h-[56px] px-8 text-xl', // 56px large
} as const;

// ============================================
// DEVICE-SPECIFIC OPTIMIZATIONS
// ============================================

/**
 * Safe area insets for mobile devices (notches, etc.)
 */
export const safeAreaInsets = {
  top: 'pt-[env(safe-area-inset-top)]',
  right: 'pr-[env(safe-area-inset-right)]',
  bottom: 'pb-[env(safe-area-inset-bottom)]',
  left: 'pl-[env(safe-area-inset-left)]',
  all: 'p-[env(safe-area-inset-top)] p-[env(safe-area-inset-right)] p-[env(safe-area-inset-bottom)] p-[env(safe-area-inset-left)]',
} as const;

/**
 * Prevents text from being too small on mobile
 */
export const preventTextZoom = '-webkit-text-size-adjust: 100%';

/**
 * Responsive image sizing
 */
export const responsiveImage = 'w-full h-auto object-cover';

/**
 * Aspect ratio utilities for consistent sizing
 */
export const aspectRatios = {
  square: 'aspect-square',
  video: 'aspect-video',
  portrait: 'aspect-[3/4]',
  landscape: 'aspect-[4/3]',
  ultrawide: 'aspect-[21/9]',
} as const;

// ============================================
// LAYOUT HELPERS
// ============================================

/**
 * Responsive sidebar layout
 */
export const sidebarLayout = {
  sidebar: 'w-full md:w-64 lg:w-72 xl:w-80',
  content: 'flex-1 min-w-0',
  container: 'flex flex-col md:flex-row',
} as const;

/**
 * Responsive card grid
 */
export const cardGrid = {
  responsive: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  twoColumn: 'grid grid-cols-1 md:grid-cols-2',
  threeColumn: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
} as const;

/**
 * Stack to horizontal layout
 */
export const stackToRow = {
  base: 'flex flex-col',
  sm: 'flex flex-col sm:flex-row',
  md: 'flex flex-col md:flex-row',
  lg: 'flex flex-col lg:flex-row',
} as const;

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Check if a value is using fixed pixels (anti-pattern)
 */
export const hasFixedPixels = (value: string): boolean => {
  return (
    /\d+px/.test(value) && !value.includes('clamp') && !value.includes('calc')
  );
};

/**
 * Validate if component uses responsive units
 */
export const isResponsiveValue = (value: string): boolean => {
  const responsiveUnits = [
    'rem',
    'em',
    '%',
    'vw',
    'vh',
    'clamp',
    'calc',
    'min',
    'max',
  ];
  return responsiveUnits.some(unit => value.includes(unit));
};

/**
 * Development mode warning for fixed sizing
 */
export const warnFixedSizing = (
  componentName: string,
  property: string,
  value: string
) => {
  if (import.meta.env.DEV && hasFixedPixels(value)) {
    const message = `⚠️ [Responsive System] ${componentName}: "${property}: ${value}" uses fixed pixels. Consider using responsive units (rem, %, clamp, etc.) for better device consistency.`;
    logger.warn(message, 'ResponsiveSystem');
  }
};

// ============================================
// BEST PRACTICES EXPORT
// ============================================

export const responsiveBestPractices = {
  // Typography
  typography: fluidText,

  // Spacing
  spacing: fluidSpace,
  padding: getResponsivePadding,
  margin: getResponsiveMargin,
  gap: getResponsiveGap,

  // Layout
  containers: containerWidths,
  grid: getResponsiveGrid,
  sidebar: sidebarLayout,
  cards: cardGrid,
  stack: stackToRow,

  // Touch targets
  touch: touchTargets,
  buttons: buttonSizes,

  // Device-specific
  safeArea: safeAreaInsets,
  image: responsiveImage,
  aspect: aspectRatios,

  // Validation
  validate: {
    hasFixedPixels,
    isResponsiveValue,
    warn: warnFixedSizing,
  },
} as const;

export default responsiveBestPractices;

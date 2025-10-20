/**
 * Responsive Utility Functions
 */

import { fluidText, containerWidths, touchTargets, aspectRatios } from './constants';

/**
 * Get responsive padding for containers
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
export const getResponsiveGrid = (cols: { sm?: number; md?: number; lg?: number; xl?: number }) => {
  const classes: string[] = ['grid'];
  
  if (cols.sm) classes.push(`grid-cols-${cols.sm}`);
  if (cols.md) classes.push(`sm:grid-cols-${cols.md}`);
  if (cols.lg) classes.push(`md:grid-cols-${cols.lg}`);
  if (cols.xl) classes.push(`lg:grid-cols-${cols.xl}`);
  
  return classes.join(' ');
};

/**
 * Layout patterns
 */
export const cardGrid = {
  responsive: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  twoColumn: 'grid grid-cols-1 md:grid-cols-2',
  threeColumn: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
} as const;

export const stackToRow = {
  base: 'flex flex-col',
  sm: 'flex flex-col sm:flex-row',
  md: 'flex flex-col md:flex-row',
  lg: 'flex flex-col lg:flex-row',
} as const;

/**
 * Safely combine class names, filtering falsy values
 */
export const safeClasses = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Best practices bundle
 */
export const responsiveBestPractices = {
  typography: fluidText,
  containers: containerWidths,
  padding: getResponsivePadding,
  margin: getResponsiveMargin,
  gap: getResponsiveGap,
  grid: getResponsiveGrid,
  cards: cardGrid,
  stack: stackToRow,
  touch: touchTargets,
  aspect: aspectRatios,
} as const;

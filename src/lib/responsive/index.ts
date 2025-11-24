/**
 * Unified Responsive System
 * Single source of truth for all responsive utilities
 */

// Re-export with explicit names to prevent circular dependencies
export {
  responsiveBestPractices,
  getResponsivePadding,
  getResponsiveMargin,
  getResponsiveGap,
  getResponsiveGrid,
  cardGrid,
  stackToRow,
  safeClasses,
} from './utilities';

export {
  useBreakpoint,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useResponsiveGrid,
  useResponsiveSpacing,
  useMatchBreakpoint,
  useOrientation,
} from './hooks';

export {
  BREAKPOINTS,
  fluidText,
  containerWidths,
  touchTargets,
  aspectRatios,
} from './constants';

// Default export for convenience
export { responsiveBestPractices as responsive } from './utilities';

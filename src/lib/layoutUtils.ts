/**
 * Layout Utilities
 * Centralized utilities for consistent layout behavior across all devices
 */

/**
 * Standard container classes for consistent max-widths
 */
export const containerClasses = {
  // Full width with no max constraint
  full: "w-full max-w-full",
  
  // Standard content containers with responsive max-widths
  sm: "w-full max-w-screen-sm mx-auto",
  md: "w-full max-w-screen-md mx-auto", 
  lg: "w-full max-w-screen-lg mx-auto",
  xl: "w-full max-w-screen-xl mx-auto",
  "2xl": "w-full max-w-screen-2xl mx-auto",
  
  // Prevents overflow on all screen sizes
  safe: "w-full max-w-[100vw] overflow-x-hidden",
  
  // For main content areas
  main: "w-full min-h-screen overflow-x-hidden",
} as const;

/**
 * Responsive padding classes
 */
export const responsivePadding = {
  none: "",
  xs: "p-2 sm:p-3 md:p-4",
  sm: "p-3 sm:p-4 md:p-5 lg:p-6",
  md: "p-4 sm:p-5 md:p-6 lg:p-8",
  lg: "p-6 sm:p-8 md:p-10 lg:p-12",
} as const;

/**
 * Responsive gap classes for flex/grid layouts
 */
export const responsiveGap = {
  xs: "gap-1 sm:gap-2",
  sm: "gap-2 sm:gap-3 md:gap-4",
  md: "gap-3 sm:gap-4 md:gap-5 lg:gap-6",
  lg: "gap-4 sm:gap-6 md:gap-8 lg:gap-10",
} as const;

/**
 * Safe flex container that prevents overflow
 */
export const flexContainer = {
  row: "flex flex-row w-full max-w-full overflow-x-hidden",
  col: "flex flex-col w-full max-w-full",
  wrap: "flex flex-wrap w-full max-w-full",
  center: "flex items-center justify-center w-full max-w-full",
} as const;

/**
 * Grid layouts that adapt responsively
 */
export const gridLayouts = {
  auto: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full",
  cols2: "grid grid-cols-1 sm:grid-cols-2 w-full",
  cols3: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 w-full",
  cols4: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full",
} as const;

/**
 * Utility function to combine classes safely
 */
export function safeClasses(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Ensures element never causes horizontal scroll
 */
export function preventOverflow(additionalClasses?: string): string {
  return safeClasses(
    "w-full max-w-full overflow-x-hidden",
    additionalClasses
  );
}

/**
 * Standard card container classes
 */
export const cardClasses = {
  base: "w-full max-w-full rounded-lg border bg-card text-card-foreground",
  padded: "w-full max-w-full rounded-lg border bg-card text-card-foreground p-4 sm:p-5 md:p-6",
  glass: "w-full max-w-full rounded-lg border bg-card/50 backdrop-blur-sm",
} as const;

/**
 * Responsive text size classes
 */
export const responsiveText = {
  xs: "text-[10px] sm:text-xs",
  sm: "text-xs sm:text-sm",
  base: "text-sm sm:text-base",
  lg: "text-base sm:text-lg md:text-xl",
  xl: "text-lg sm:text-xl md:text-2xl",
  "2xl": "text-xl sm:text-2xl md:text-3xl",
  "3xl": "text-2xl sm:text-3xl md:text-4xl",
} as const;

/**
 * Touch target sizes (minimum 44x44px for accessibility)
 */
export const touchTargets = {
  sm: "min-w-[40px] min-h-[40px]",
  md: "min-w-[44px] min-h-[44px]",
  lg: "min-w-[48px] min-h-[48px]",
} as const;

/**
 * Safe scrollable area that works on all devices
 */
export function scrollableArea(maxHeight?: string): string {
  return safeClasses(
    "w-full max-w-full overflow-y-auto overflow-x-hidden",
    maxHeight
  );
}

/**
 * Layout debugging (only use in development)
 */
export const debugLayout = {
  outline: "outline outline-2 outline-red-500",
  overflow: "outline outline-2 outline-yellow-500",
  bounds: "outline outline-2 outline-blue-500",
} as const;

/**
 * Responsive System Constants
 */

export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * Fluid typography scale - automatically adjusts based on viewport
 */
export const fluidText = {
  xs: 'text-[clamp(0.75rem,2vw,0.875rem)]',
  sm: 'text-[clamp(0.875rem,2.5vw,1rem)]',
  base: 'text-[clamp(1rem,3vw,1.125rem)]',
  lg: 'text-[clamp(1.125rem,3.5vw,1.25rem)]',
  xl: 'text-[clamp(1.25rem,4vw,1.5rem)]',
  '2xl': 'text-[clamp(1.5rem,5vw,2rem)]',
  '3xl': 'text-[clamp(1.875rem,6vw,2.5rem)]',
  '4xl': 'text-[clamp(2.25rem,7vw,3rem)]',
  '5xl': 'text-[clamp(3rem,8vw,4rem)]',
} as const;

/**
 * Responsive container widths
 */
export const containerWidths = {
  sm: 'max-w-[640px]',
  md: 'max-w-[768px]',
  lg: 'max-w-[1024px]',
  xl: 'max-w-[1280px]',
  '2xl': 'max-w-[1536px]',
  full: 'max-w-full',
  prose: 'max-w-[65ch]',
} as const;

/**
 * Touch target sizes (WCAG AAA Compliance)
 */
export const touchTargets = {
  minimum: 'min-h-[44px] min-w-[44px]',
  comfortable: 'min-h-[48px] min-w-[48px]',
  large: 'min-h-[56px] min-w-[56px]',
} as const;

/**
 * Aspect ratios
 */
export const aspectRatios = {
  square: 'aspect-square',
  video: 'aspect-video',
  portrait: 'aspect-[3/4]',
  landscape: 'aspect-[4/3]',
  ultrawide: 'aspect-[21/9]',
} as const;

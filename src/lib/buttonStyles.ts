/**
 * Button Size Standards
 * Consistent button sizing across the app
 */

export const buttonSizes = {
  // Icon-only buttons - Mobile-first with proper touch targets
  icon: 'min-h-[44px] min-w-[44px] h-11 w-11',
  iconSm: 'min-h-[44px] min-w-[44px] h-10 w-10 sm:min-h-[40px] sm:min-w-[40px] sm:h-8 sm:w-8',
  iconLg: 'min-h-[48px] min-w-[48px] h-12 w-12',

  // Text buttons - Mobile-first with proper touch targets
  sm: 'min-h-[44px] h-10 px-3 text-xs sm:min-h-[40px] sm:h-8',
  default: 'min-h-[44px] h-11 px-4 text-sm',
  lg: 'min-h-[48px] h-12 px-8 text-base',
  xl: 'min-h-[48px] h-12 px-10 text-lg',

  // Full width variants - Mobile-first with proper touch targets
  fullSm: 'min-h-[44px] h-10 w-full text-xs sm:min-h-[40px] sm:h-8',
  full: 'min-h-[44px] h-11 w-full text-sm',
  fullLg: 'min-h-[48px] h-12 w-full text-base',
} as const;

/**
 * Common Button Patterns
 */
export const buttonPatterns = {
  // Back navigation buttons
  backButton: 'hover:bg-secondary/20 hover:-translate-x-1 transition-all',

  // Primary action buttons
  primaryAction:
    'border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_hsl(var(--foreground))] transition-all',

  // Secondary/outline buttons
  secondaryAction: 'hover:bg-secondary/5 hover:-translate-y-0.5 transition-all',

  // Destructive buttons
  destructiveAction: 'hover:scale-105 transition-all',
} as const;

/**
 * Usage Guidelines:
 *
 * 1. Navigation buttons (back, close): size="sm" or "icon"
 * 2. Form submit buttons: size="default" with full width on mobile
 * 3. Primary CTA buttons: size="lg" with primaryAction pattern
 * 4. Secondary actions: size="default" with secondaryAction pattern
 * 5. Destructive actions: size="default" with destructiveAction pattern
 * 6. Icon-only buttons: Use appropriate icon size variant
 */

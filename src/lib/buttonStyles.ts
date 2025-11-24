/**
 * Button Size Standards
 * Consistent button sizing across the app
 */

export const buttonSizes = {
  // Icon-only buttons
  icon: 'h-10 w-10',
  iconSm: 'h-8 w-8',
  iconLg: 'h-12 w-12',

  // Text buttons
  sm: 'h-8 px-3 text-xs',
  default: 'h-10 px-4 text-sm',
  lg: 'h-11 px-8 text-base',
  xl: 'h-12 px-10 text-lg',

  // Full width variants
  fullSm: 'h-8 w-full text-xs',
  full: 'h-10 w-full text-sm',
  fullLg: 'h-11 w-full text-base',
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

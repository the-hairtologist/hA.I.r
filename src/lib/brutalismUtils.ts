/**
 * Adaptive Brutalism Design System Utilities
 * Helper functions and constants for consistent brutalist styling
 */

import { cn } from '@/lib/utils';

/**
 * Typography Classes
 * Use these for consistent text styling across the app
 */
export const typography = {
  // Headers (Press Start 2P)
  headerXL: 'font-pixel text-2xl sm:text-3xl lg:text-4xl',
  headerLG: 'font-pixel text-xl sm:text-2xl lg:text-3xl',
  headerMD: 'font-pixel text-lg sm:text-xl lg:text-2xl',
  headerSM: 'font-pixel text-base sm:text-lg',

  // CTAs (Bold Sans)
  cta: 'font-bold uppercase tracking-wide',
  ctaLarge: 'font-bold uppercase tracking-wide text-base sm:text-lg',

  // Body Text (DM Sans - readable)
  bodyLarge: 'font-sans text-sm sm:text-base',
  body: 'font-sans text-xs sm:text-sm',
  bodySmall: 'font-sans text-[11px] sm:text-xs',

  // Data/Stats (Space Grotesk)
  stat: 'font-display text-3xl font-bold',
  statLabel: 'font-sans text-xs text-muted-foreground',
} as const;

/**
 * Brutalist Component Patterns
 * Pre-built class combinations for common patterns
 */
export const brutalist = {
  // Cards
  card: 'brutal-border shadow-brutal-lg rounded-xl bg-card',
  cardHover:
    'hover:shadow-brutal-xl hover:-translate-y-1 transition-all',
  cardInteractive:
    'brutal-border shadow-brutal-lg rounded-xl bg-card hover:shadow-brutal-xl hover:-translate-y-1 transition-all cursor-pointer',

  // Buttons
  button:
    'brutal-border shadow-brutal-md',
  buttonHover:
    'hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-xs active:shadow-none active:translate-x-[4px] active:translate-y-[4px]',
  buttonFull:
    'brutal-border shadow-brutal-md hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-xs',

  // Borders
  borderStandard: 'brutal-border',
  borderBold: 'brutal-border-bold',

  // Shadows
  shadowSM: 'shadow-brutal-xs',
  shadowMD: 'shadow-brutal-sm',
  shadowLG: 'shadow-brutal-lg',
  shadowXL: 'shadow-brutal-xl',

  // Gradients
  gradientBg: 'bg-gradient-to-br from-primary/5 to-secondary/5',
  gradientBgAccent: 'bg-gradient-to-br from-accent/5 to-primary/5',

  // Glass Brutal (modern fusion)
  glass: 'backdrop-blur-xl bg-background/80 brutal-border-subtle border-foreground/20',
} as const;

/**
 * Helper function to combine brutalist styles
 */
export const getBrutalistClasses = (...styles: string[]) => {
  return cn(...styles);
};

/**
 * Pre-configured component variants
 */
export const brutalComponents = {
  emptyState: cn(brutalist.card, brutalist.gradientBg, 'py-12 text-center'),

  statCard: cn(brutalist.card, brutalist.cardHover, 'p-4 sm:p-5'),

  actionCard: cn(brutalist.cardInteractive, brutalist.gradientBg, 'p-6'),

  primaryButton: cn(
    brutalist.buttonFull,
    typography.cta,
    'bg-primary text-primary-foreground'
  ),

  secondaryButton: cn(
    brutalist.buttonFull,
    typography.cta,
    'bg-secondary text-secondary-foreground'
  ),
} as const;

/**
 * Mobile touch target sizes (accessibility)
 */
export const touchTargets = {
  minimum: 'min-h-[44px] min-w-[44px]',
  comfortable: 'min-h-[48px] min-w-[48px]',
  large: 'min-h-[56px] min-w-[56px]',
} as const;

/**
 * Responsive spacing patterns
 */
export const spacing = {
  cardPadding: 'p-4 sm:p-5 md:p-6',
  cardGap: 'space-y-4',
  sectionGap: 'space-y-6',
  gridGap: 'gap-3 sm:gap-4',
} as const;

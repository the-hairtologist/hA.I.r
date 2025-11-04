/**
 * Typography Design System
 * Consistent font hierarchy and sizing patterns for mobile-first responsive design
 */

export const typography = {
  // Page Titles - font-pixel for retro branding
  title: {
    page: 'font-pixel text-xl sm:text-2xl lg:text-3xl',
    section: 'font-pixel text-base sm:text-lg lg:text-xl',
    card: 'font-pixel text-sm sm:text-base',
  },

  // Headings - font-display for hierarchy
  heading: {
    h1: 'font-display text-2xl sm:text-3xl lg:text-4xl font-bold',
    h2: 'font-display text-xl sm:text-2xl lg:text-3xl font-semibold',
    h3: 'font-display text-lg sm:text-xl lg:text-2xl font-semibold',
    h4: 'font-display text-base sm:text-lg font-semibold',
  },

  // Body Text - font-sans for readability
  body: {
    large: 'font-sans text-base sm:text-lg',
    default: 'font-sans text-sm sm:text-base',
    small: 'font-sans text-xs sm:text-sm',
    tiny: 'font-sans text-xs',
  },

  // Display Numbers/Stats - font-display for emphasis
  stat: {
    primary: 'font-display text-3xl sm:text-4xl lg:text-5xl font-bold tabular-nums',
    secondary: 'font-display text-2xl sm:text-3xl lg:text-4xl font-bold tabular-nums',
    tertiary: 'font-display text-xl sm:text-2xl lg:text-3xl font-semibold tabular-nums',
    small: 'font-display text-lg sm:text-xl font-semibold tabular-nums',
  },

  // Labels & UI Elements
  label: {
    default: 'font-sans text-sm font-medium',
    small: 'font-sans text-xs font-medium',
    large: 'font-sans text-base font-medium',
  },

  // Descriptions & Helper Text
  description: {
    default: 'font-sans text-sm text-muted-foreground',
    small: 'font-sans text-xs text-muted-foreground',
  },

  // Buttons - inherit from context
  button: {
    default: 'font-sans text-sm sm:text-base font-medium',
    small: 'font-sans text-xs sm:text-sm font-medium',
    large: 'font-sans text-base sm:text-lg font-medium',
  },

  // Code & Monospace
  code: {
    inline: 'font-mono text-sm',
    block: 'font-mono text-xs sm:text-sm',
  },
};

// Common text color patterns
export const textColors = {
  primary: 'text-foreground',
  secondary: 'text-muted-foreground',
  accent: 'text-primary',
  muted: 'text-muted-foreground',
  error: 'text-destructive',
  success: 'text-success',
  warning: 'text-warning',
};

// Gradient text utility
export const gradientText = 'bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary';

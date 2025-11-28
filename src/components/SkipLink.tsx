/**
 * SkipLink Component
 * Provides keyboard navigation shortcut to main content
 * WCAG 2.2 AA Requirement for accessibility
 */

import React from 'react';

interface SkipLinkProps {
  /** Target element ID (e.g., "main-content") */
  targetId: string;
  /** Link text (default: "Skip to main content") */
  label?: string;
}

export const SkipLink: React.FC<SkipLinkProps> = ({
  targetId,
  label = 'Skip to main content',
}) => {
  return (
    <a
      href={`#${targetId}`}
      className="
        sr-only 
        focus:not-sr-only 
        focus:absolute 
        focus:top-4 
        focus:left-4 
        focus:z-50 
        focus:bg-primary 
        focus:text-primary-foreground 
        focus:px-4 
        focus:py-2 
        focus:rounded 
        focus:shadow-lg
        focus:ring-2
        focus:ring-ring
        focus:ring-offset-2
        focus:outline-none
        transition-all
        duration-200
      "
      tabIndex={0}
      aria-label={label}
    >
      {label}
    </a>
  );
};

/**
 * Usage Example:
 *
 * // In your DashboardLayout or main layout component:
 *
 * import { SkipLink } from '@/components/SkipLink';
 *
 * export const DashboardLayout = ({ children }) => {
 *   return (
 *     <div>
 *       <SkipLink targetId="main-content" />
 *
 *       <header>
 *         <nav>...</nav>
 *       </header>
 *
 *       <main id="main-content" role="main" tabIndex={-1}>
 *         {children}
 *       </main>
 *     </div>
 *   );
 * };
 *
 * Benefits:
 * - Keyboard users can skip repetitive navigation
 * - Screen reader users get quick access to main content
 * - Improves WCAG 2.2 AA compliance score
 * - Only visible when focused (doesn't affect visual design)
 */

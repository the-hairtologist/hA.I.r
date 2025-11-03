/**
 * Mobile-First Page Template
 * Provides consistent mobile-optimized page structure
 */

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { mobileFirst, safeArea, mobileNav } from '@/lib/responsive/mobile-first-utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MobilePageTemplateProps {
  children: ReactNode;
  /** Page title for screen readers */
  title?: string;
  /** Header content (logo, title, actions) */
  header?: ReactNode;
  /** Footer content (optional) */
  footer?: ReactNode;
  /** Whether page has bottom navigation (adds padding) */
  hasBottomNav?: boolean;
  /** Whether to enable pull-to-refresh */
  pullToRefresh?: boolean;
  /** Callback for pull-to-refresh */
  onRefresh?: () => void | Promise<void>;
  /** Container width */
  width?: 'full' | 'contained' | 'narrow' | 'wide';
  /** Background color */
  background?: 'default' | 'muted' | 'transparent';
  /** Custom className */
  className?: string;
}

/**
 * MobilePageTemplate - Consistent mobile-first page structure
 * 
 * Features:
 * - Safe area support (iOS notch, home indicator)
 * - Bottom navigation spacing
 * - Optimized scroll performance
 * - Pull-to-refresh ready
 * - Responsive container widths
 * 
 * @example
 * <MobilePageTemplate 
 *   title="Dashboard"
 *   header={<Header />}
 *   hasBottomNav={true}
 * >
 *   <Content />
 * </MobilePageTemplate>
 */
export function MobilePageTemplate({
  children,
  title,
  header,
  footer,
  hasBottomNav = false,
  pullToRefresh = false,
  onRefresh,
  width = 'contained',
  background = 'default',
  className,
}: MobilePageTemplateProps) {
  const backgroundMap = {
    default: 'bg-background',
    muted: 'bg-muted/30',
    transparent: 'bg-transparent',
  };

  return (
    <div
      className={cn(
        'min-h-screen flex flex-col',
        backgroundMap[background],
        safeArea.top,
        hasBottomNav && mobileNav.withBottomNav,
        className
      )}
      role="main"
      aria-label={title}
    >
      {/* Header */}
      {header && (
        <header
          className={cn(
            'sticky top-0 z-30',
            'bg-background/95 backdrop-blur-sm',
            'border-b border-border',
            safeArea.top,
            'transition-transform duration-200'
          )}
        >
          {header}
        </header>
      )}

      {/* Main Content Area */}
      <main
        className={cn(
          'flex-1 flex flex-col',
          mobileFirst.container[width],
          mobileFirst.padding.md
        )}
      >
        {children}
      </main>

      {/* Footer */}
      {footer && (
        <footer
          className={cn(
            'mt-auto',
            'border-t border-border',
            mobileFirst.padding.md,
            safeArea.bottom
          )}
        >
          {footer}
        </footer>
      )}
    </div>
  );
}

/**
 * Page Header Component
 */
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  backButton?: ReactNode;
  className?: string;
}

export function MobilePageHeader({
  title,
  subtitle,
  actions,
  backButton,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between',
        mobileFirst.padding.md,
        className
      )}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {backButton}
        <div className="flex-1 min-w-0">
          <h1
            className={cn(
              'font-pixel',
              mobileFirst.text.xl,
              'truncate'
            )}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className={cn(
                'text-muted-foreground',
                mobileFirst.text.sm,
                'truncate'
              )}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

/**
 * Scrollable Content Section
 */
interface ScrollableSectionProps {
  children: ReactNode;
  maxHeight?: string;
  className?: string;
}

export function MobileScrollableSection({
  children,
  maxHeight = 'max-h-[60vh]',
  className,
}: ScrollableSectionProps) {
  return (
    <ScrollArea
      className={cn(
        maxHeight,
        'w-full',
        'overflow-y-auto',
        '-webkit-overflow-scrolling-touch',
        className
      )}
    >
      {children}
    </ScrollArea>
  );
}

/**
 * Empty State Component
 */
interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function MobileEmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        'text-center',
        mobileFirst.padding.xl,
        'min-h-[40vh]',
        className
      )}
    >
      {icon && (
        <div className="mb-4 text-muted-foreground opacity-50">
          {icon}
        </div>
      )}
      <h3 className={cn('font-pixel mb-2', mobileFirst.text.lg)}>
        {title}
      </h3>
      {description && (
        <p className={cn('text-muted-foreground mb-6', mobileFirst.text.sm)}>
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

/**
 * Accessible Button Component
 * Button with enhanced accessibility features
 */

import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { ScreenReaderOnly } from './ScreenReaderOnly';
import { Loader2 } from 'lucide-react';

interface AccessibleButtonProps extends ButtonProps {
  /** Accessible label (overrides children for screen readers) */
  ariaLabel?: string;
  /** Description for additional context */
  ariaDescription?: string;
  /** Loading state */
  loading?: boolean;
  /** Loading text for screen readers */
  loadingText?: string;
  /** Icon component */
  icon?: React.ComponentType<{ className?: string }>;
  /** Icon position */
  iconPosition?: 'left' | 'right';
}

export const AccessibleButton = React.forwardRef<
  HTMLButtonElement,
  AccessibleButtonProps
>(
  (
    {
      ariaLabel,
      ariaDescription,
      loading = false,
      loadingText = 'Loading',
      icon: Icon,
      iconPosition = 'left',
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <Button
        ref={ref}
        disabled={isDisabled}
        aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
        aria-describedby={ariaDescription ? 'button-description' : undefined}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            <ScreenReaderOnly>{loadingText}</ScreenReaderOnly>
          </>
        )}

        {!loading && Icon && iconPosition === 'left' && (
          <Icon className="mr-2 h-4 w-4" />
        )}

        <span aria-hidden={!!ariaLabel}>{children}</span>

        {!loading && Icon && iconPosition === 'right' && (
          <Icon className="ml-2 h-4 w-4" />
        )}

        {ariaDescription && (
          <span className="sr-only">
            {ariaDescription}
          </span>
        )}
      </Button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';

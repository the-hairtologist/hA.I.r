/**
 * Accessible Icon Component
 * Ensures icons are properly announced to screen readers
 */

import React from 'react';
import { ScreenReaderOnly } from './ScreenReaderOnly';

interface AccessibleIconProps {
  /** Icon component from lucide-react or similar */
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /** Accessible label for screen readers */
  label: string;
  /** Whether icon is decorative (no label needed) */
  decorative?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Size */
  size?: number;
}

export const AccessibleIcon: React.FC<AccessibleIconProps> = ({
  icon: Icon,
  label,
  decorative = false,
  className,
  size,
}) => {
  if (decorative) {
    return (
      <Icon
        className={className}
        aria-hidden="true"
        focusable="false"
        width={size}
        height={size}
      />
    );
  }

  return (
    <span className="inline-flex items-center">
      <Icon
        className={className}
        aria-hidden="true"
        focusable="false"
        width={size}
        height={size}
      />
      <ScreenReaderOnly>{label}</ScreenReaderOnly>
    </span>
  );
};

/**
 * Icon Button with Accessible Label
 */
interface AccessibleIconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  iconClassName?: string;
  size?: number;
}

export const AccessibleIconButton: React.FC<AccessibleIconButtonProps> = ({
  icon: Icon,
  label,
  iconClassName,
  size = 16,
  className,
  ...buttonProps
}) => {
  return (
    <button
      {...buttonProps}
      aria-label={label}
      className={className}
      type={buttonProps.type || 'button'}
    >
      <Icon
        className={iconClassName}
        aria-hidden="true"
        focusable="false"
        width={size}
        height={size}
      />
      <ScreenReaderOnly>{label}</ScreenReaderOnly>
    </button>
  );
};

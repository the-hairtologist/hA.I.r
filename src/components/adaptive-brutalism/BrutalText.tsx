import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { typography } from '@/lib/brutalismUtils';

interface BrutalTextProps {
  children: ReactNode;
  size?: 'large' | 'normal' | 'small';
  className?: string;
  muted?: boolean;
}

/**
 * BrutalText - DM Sans readable body text
 * Use for all paragraphs, descriptions, and readable content
 */
export const BrutalText = ({
  children,
  size = 'normal',
  className,
  muted = false,
}: BrutalTextProps) => {
  const sizeClasses = {
    large: typography.bodyLarge,
    normal: typography.body,
    small: typography.bodySmall,
  };

  return (
    <p
      className={cn(
        sizeClasses[size],
        muted && 'text-muted-foreground',
        className
      )}
    >
      {children}
    </p>
  );
};

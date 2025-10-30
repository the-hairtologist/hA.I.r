import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { brutalist, spacing } from '@/lib/brutalismUtils';

interface BrutalCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  onClick?: () => void;
}

/**
 * BrutalCard - Adaptive Brutalism card component
 * Combines brutalist aesthetics with readable content
 */
export const BrutalCard = ({
  children,
  className,
  hover = false,
  gradient = false,
  onClick,
}: BrutalCardProps) => {
  return (
    <div
      className={cn(
        brutalist.card,
        hover && brutalist.cardHover,
        gradient && brutalist.gradientBg,
        spacing.cardPadding,
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
};

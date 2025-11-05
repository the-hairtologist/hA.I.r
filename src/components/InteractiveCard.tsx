/**
 * Interactive Card Component
 * Cards with delightful hover effects and micro-interactions
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InteractiveCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  gradient?: string;
  onClick?: () => void;
  children?: React.ReactNode;
  badge?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  interactive?: boolean;
}

export const InteractiveCard = ({
  title,
  description,
  icon: Icon,
  iconColor = 'text-primary',
  gradient = 'from-blue-400 to-cyan-400',
  onClick,
  children,
  badge,
  footer,
  className,
  interactive = true,
}: InteractiveCardProps) => {
  return (
    <Card
      onClick={onClick}
      className={cn(
        'brutal-border brutal-shadow-sm transition-all duration-300',
        interactive &&
          onClick &&
          'cursor-pointer hover:-translate-y-2 hover:shadow-brutal-2xl active:translate-y-0 active:brutal-shadow-sm',
        `bg-gradient-to-br ${gradient}`,
        className
      )}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <CardHeader className="relative">
        {badge && <div className="absolute top-4 right-4">{badge}</div>}

        {Icon && (
          <div className="bg-card brutal-border w-14 h-14 rounded-lg flex items-center justify-center mb-4 brutal-shadow-xs">
            <Icon className={cn('h-7 w-7', iconColor)} aria-hidden="true" />
          </div>
        )}

        <CardTitle className="font-pixel text-xl text-foreground">
          {title}
        </CardTitle>

        {description && (
          <CardDescription className="font-sans text-foreground/80 font-medium">
            {description}
          </CardDescription>
        )}
      </CardHeader>

      {children && (
        <CardContent className="text-foreground/90">{children}</CardContent>
      )}

      {footer && (
        <CardContent className="pt-0 border-t-2 border-foreground/10 mt-4">
          {footer}
        </CardContent>
      )}
    </Card>
  );
};

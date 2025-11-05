import * as React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ModernEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'brutal' | 'glass' | 'elevated' | 'minimal';
  illustration?: 'float' | 'glow' | 'none';
  className?: string;
}

export const ModernEmptyState = React.forwardRef<
  HTMLDivElement,
  ModernEmptyStateProps
>(
  (
    {
      icon: Icon,
      title,
      description,
      action,
      secondaryAction,
      variant = 'brutal',
      illustration = 'float',
      className,
    },
    ref
  ) => {
    return (
      <Card
        ref={ref}
        variant={variant === 'minimal' ? 'flat' : variant}
        className={cn(
          'w-full max-w-2xl mx-auto text-center p-12',
          'animate-fade-in',
          variant === 'glass' && 'backdrop-blur-xl',
          className
        )}
      >
        <div className="flex flex-col items-center gap-6">
          {Icon && (
            <div
              className={cn(
                'relative p-6 rounded-2xl transition-all duration-500',
                'brutal-border shadow-brutal-md',
                illustration === 'float' && 'float',
                illustration === 'glow' && 'glow-pulse',
                'bg-gradient-to-br from-primary/10 to-accent/10'
              )}
            >
              <Icon className="h-16 w-16 text-primary" strokeWidth={1.5} />

              {/* Decorative elements */}
              <div className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-accent border-2 border-foreground" />
              <div className="absolute -bottom-2 -left-2 h-3 w-3 rounded-full bg-secondary border-2 border-foreground" />
            </div>
          )}

          <div className="space-y-3 max-w-md">
            <h3 className="text-2xl font-pixel font-bold text-foreground">
              {title}
            </h3>

            {description && (
              <p className="text-base font-sans text-muted-foreground leading-relaxed">
                {description}
              </p>
            )}
          </div>

          {(action || secondaryAction) && (
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              {action && (
                <Button
                  onClick={action.onClick}
                  size="lg"
                  className="gap-2 group"
                >
                  <span>{action.label}</span>
                  <span className="group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </Button>
              )}

              {secondaryAction && (
                <Button
                  onClick={secondaryAction.onClick}
                  variant="outline"
                  size="lg"
                >
                  {secondaryAction.label}
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>
    );
  }
);

ModernEmptyState.displayName = 'ModernEmptyState';

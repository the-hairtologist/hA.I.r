import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { mobileFirst } from '@/lib/responsive/mobile-first-utils';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  gradient?: string;
  'aria-label'?: string;
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
  gradient = 'bg-gradient-purple-pink',
  'aria-label': ariaLabel,
}: EmptyStateProps) => {
  return (
    <Card
      className={`animate-fade-in brutal-border shadow-brutal-lg hover:shadow-brutal-xl transition-all duration-300 ${className}`}
      role="status"
      aria-label={ariaLabel || `${title}: ${description}`}
    >
      <CardContent className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div
          className={`w-20 h-20 rounded-2xl ${gradient} flex items-center justify-center mb-6 brutal-border shadow-brutal-md animate-scale-in`}
        >
          <Icon className="h-10 w-10 text-on-surface-primary" />
        </div>
        <h3 className={cn(mobileFirst.text['2xl'], "font-bold mb-2 font-pixel")}>
          {title}
        </h3>
        <p className={cn(
          mobileFirst.text.base,
          "font-sans text-muted-foreground mb-6 max-w-md"
        )}>
          {description}
        </p>
        {actionLabel && onAction && (
          <Button onClick={onAction} size="lg" className="gap-2">
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

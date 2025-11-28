import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface EmptyStateCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyStateCard = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
}: EmptyStateCardProps) => {
  return (
    <Card className={`animate-fade-in ${className}`}>
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
        {(actionLabel || secondaryActionLabel) && (
          <div className="flex flex-col sm:flex-row gap-3">
            {actionLabel && onAction && (
              <Button onClick={onAction} size="lg">
                {actionLabel}
              </Button>
            )}
            {secondaryActionLabel && onSecondaryAction && (
              <Button onClick={onSecondaryAction} variant="outline" size="lg">
                {secondaryActionLabel}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const EmptyTableState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: Omit<
  EmptyStateCardProps,
  'secondaryActionLabel' | 'onSecondaryAction' | 'className'
>) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        <Icon className="w-10 h-10 text-muted-foreground" />
      </div>
      <h3 className="text-2xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-lg text-lg">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="lg" className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

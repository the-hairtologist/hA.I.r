import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface HelpfulEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export const HelpfulEmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: HelpfulEmptyStateProps) => {
  return (
    <Card className="brutal-border brutal-shadow-md bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardContent className="py-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-pixel mb-2">{title}</h3>
        <p className="font-sans text-sm text-muted-foreground mb-6 max-w-md mx-auto">
          {description}
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            onClick={onAction}
            className="gap-2 font-bold uppercase tracking-wide"
          >
            {actionLabel}
          </Button>
          {secondaryActionLabel && onSecondaryAction && (
            <Button
              variant="outline"
              onClick={onSecondaryAction}
              className="gap-2 font-bold uppercase tracking-wide"
            >
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

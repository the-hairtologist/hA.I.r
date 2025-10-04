/**
 * Enhanced Empty State Component
 * Provides delightful, actionable empty states with personality
 */

import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateEnhancedProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  illustration?: React.ReactNode;
  className?: string;
}

export const EmptyStateEnhanced = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  illustration,
  className
}: EmptyStateEnhancedProps) => {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in",
        className
      )}
      role="region"
      aria-label="Empty state"
    >
      {illustration || (
        <div className="relative mb-6">
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-8 rounded-full border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
            <Icon className="h-16 w-16 text-primary" aria-hidden="true" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-secondary p-2 rounded-full border-2 border-foreground">
            <span className="text-2xl" role="img" aria-label="sparkles">✨</span>
          </div>
        </div>
      )}
      
      <h2 className="text-2xl font-display font-bold mb-2 gradient-text">
        {title}
      </h2>
      
      <p className="text-muted-foreground mb-6 max-w-md">
        {description}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        {actionLabel && onAction && (
          <Button 
            onClick={onAction}
            size="lg"
            className="gap-2 hover-scale"
          >
            {actionLabel}
          </Button>
        )}
        
        {secondaryActionLabel && onSecondaryAction && (
          <Button 
            onClick={onSecondaryAction}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

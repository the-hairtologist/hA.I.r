import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface UnifiedEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
}

const variantClasses = {
  blue: 'bg-info/20',
  green: 'bg-success/20',
  yellow: 'bg-warning/20',
  purple: 'bg-accent/20',
  red: 'bg-destructive/20',
};

/**
 * Unified Empty State Component
 * Replaces: EmptyState, HelpfulEmptyState, AIEnhancedEmptyState, EmptyStateEnhanced, modern-empty-state
 * 
 * Usage:
 * <UnifiedEmptyState
 *   icon={Search}
 *   title="No results found"
 *   description="Try adjusting your search or filters"
 *   actionLabel="Clear Filters"
 *   onAction={() => clearFilters()}
 *   variant="yellow"
 * />
 */
export const UnifiedEmptyState: React.FC<UnifiedEmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  variant = 'yellow',
}) => {
  return (
    <Card className={`border-[3px] border-foreground shadow-[5px_5px_0px_0px_hsl(var(--foreground))] ${variantClasses[variant]}`}>
      <CardContent className="pt-8 pb-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-card border-2 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))] flex items-center justify-center">
          <Icon className="h-8 w-8 text-foreground" />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-2 font-display">{title}</h3>
        <p className="text-foreground/80 font-medium mb-4 max-w-sm mx-auto">
          {description}
        </p>
        {actionLabel && onAction && (
          <Button 
            variant="outline" 
            onClick={onAction}
            className="border-2 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))] hover:shadow-[3px_3px_0px_0px_hsl(var(--foreground))] hover:-translate-y-0.5 transition-all"
          >
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

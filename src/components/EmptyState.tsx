import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) => {
  return (
    <Card className={`animate-fade-in ${className}`}>
      <CardContent className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4 animate-scale-in">
          <Icon className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
        {actionLabel && onAction && (
          <Button onClick={onAction} size="lg">
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

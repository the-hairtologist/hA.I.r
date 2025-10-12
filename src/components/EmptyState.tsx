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
  gradient?: string;
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
  gradient = "bg-gradient-purple-pink",
}: EmptyStateProps) => {
  return (
    <Card className={`animate-fade-in border-[3px] border-foreground shadow-brutal-lg hover:shadow-brutal-xl transition-all duration-300 ${className}`}>
      <CardContent className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className={`w-20 h-20 rounded-2xl ${gradient} flex items-center justify-center mb-6 border-[3px] border-foreground shadow-brutal-md animate-scale-in`}>
          <Icon className="h-10 w-10 text-white" />
        </div>
        <h3 className="text-2xl font-bold mb-2 font-display">{title}</h3>
        <p className="text-muted-foreground mb-6 max-w-md text-base">{description}</p>
        {actionLabel && onAction && (
          <Button onClick={onAction} size="lg" className="gap-2">
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

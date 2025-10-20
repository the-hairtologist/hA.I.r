import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ErrorRecoveryProps {
  error: Error | string;
  onRetry?: () => void;
  actionLabel?: string;
  className?: string;
  variant?: "inline" | "card";
}

export const ErrorRecovery = ({
  error,
  onRetry,
  actionLabel = "Try Again",
  className,
  variant = "card",
}: ErrorRecoveryProps) => {
  const errorMessage = typeof error === "string" ? error : error.message;
  
  const content = (
    <>
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0 space-y-2">
          <p className="text-sm font-medium text-destructive">Something went wrong</p>
          <p className="text-xs text-muted-foreground break-words">{errorMessage}</p>
          
          {onRetry && (
            <Button
              size="sm"
              variant="outline"
              onClick={onRetry}
              className="brutal-border mt-2 min-h-[44px]"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {actionLabel}
            </Button>
          )}
        </div>
      </div>
    </>
  );

  if (variant === "inline") {
    return (
      <div className={cn("p-4 border-2 border-destructive rounded-lg bg-destructive/5", className)}>
        {content}
      </div>
    );
  }

  return (
    <Card className={cn("brutal-border brutal-shadow-sm", className)}>
      <CardHeader>
        <CardTitle className="text-sm sm:text-base">Error</CardTitle>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
};

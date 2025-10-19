/**
 * User-Friendly Error States
 * Provides clear, actionable feedback when things go wrong
 */

import { AlertCircle, RefreshCw, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showHomeButton?: boolean;
  showBackButton?: boolean;
  variant?: "default" | "minimal" | "inline";
}

export const ErrorState = ({
  title = "Something went wrong",
  message = "We're having trouble loading this content. Please try again.",
  onRetry,
  showHomeButton = false,
  showBackButton = false,
  variant = "default"
}: ErrorStateProps) => {
  const navigate = useNavigate();

  if (variant === "inline") {
    return (
      <div className="flex items-center gap-2 p-3 border border-destructive/50 bg-destructive/10 rounded-lg">
        <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
        <p className="text-sm text-destructive">{message}</p>
        {onRetry && (
          <Button
            onClick={onRetry}
            size="sm"
            variant="ghost"
            className="ml-auto"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        )}
      </div>
    );
  }

  if (variant === "minimal") {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm mb-4">{message}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[400px] w-full p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-3 bg-destructive/10 rounded-full">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">{title}</h3>
              <p className="text-muted-foreground text-sm">{message}</p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center pt-2">
              {onRetry && (
                <Button onClick={onRetry} variant="default">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              )}
              {showBackButton && (
                <Button onClick={() => navigate(-1)} variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Button>
              )}
              {showHomeButton && (
                <Button onClick={() => navigate("/")} variant="outline">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const EmptyState = ({
  icon: Icon = AlertCircle,
  title = "No items found",
  description = "Get started by creating your first item",
  action
}: {
  icon?: React.ElementType;
  title?: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
      <div className="p-4 bg-muted rounded-full mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm mb-4 max-w-md">{description}</p>
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};
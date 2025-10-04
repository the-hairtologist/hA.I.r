/**
 * Enhanced Loading State Component
 * Provides accessible, branded loading experiences
 */

import { Scissors } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
  className?: string;
}

export const LoadingState = ({ 
  message = "Loading...", 
  size = "md",
  fullScreen = false,
  className 
}: LoadingStateProps) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-12 w-12",
    lg: "h-16 w-16"
  };

  const containerClasses = fullScreen 
    ? "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400"
    : "flex items-center justify-center py-8";

  return (
    <div className={cn(containerClasses, className)} role="status" aria-live="polite">
      <div className="text-center bg-card p-8 rounded-xl border-[3px] border-foreground shadow-[8px_8px_0px_0px_hsl(var(--foreground))] animate-fade-in">
        <div className="relative mb-4">
          <Scissors 
            className={cn(sizeClasses[size], "text-primary animate-pulse mx-auto")} 
            aria-hidden="true"
          />
          <div className={cn(
            sizeClasses[size],
            "absolute inset-0 mx-auto rounded-full border-4 border-primary/20 border-t-primary animate-spin"
          )} />
        </div>
        <p className="text-muted-foreground font-medium">
          {message}
        </p>
        <span className="sr-only">{message}</span>
      </div>
    </div>
  );
};

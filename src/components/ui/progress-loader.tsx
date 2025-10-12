/**
 * Progress Loader Component
 * Provides visual feedback during data loading
 */

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ProgressLoaderProps {
  loading: boolean;
  message?: string;
  className?: string;
  variant?: "linear" | "circular" | "skeleton";
}

export const ProgressLoader = ({ 
  loading, 
  message = "Loading...", 
  className,
  variant = "linear" 
}: ProgressLoaderProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!loading) {
      setProgress(0);
      return;
    }

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + 10;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [loading]);

  if (!loading) return null;

  if (variant === "circular") {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-3 p-8", className)}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </div>
    );
  }

  if (variant === "skeleton") {
    return (
      <div className={cn("space-y-3", className)}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-muted rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <Progress value={progress} className="h-2" />
      {message && (
        <p className="text-sm text-muted-foreground text-center animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};
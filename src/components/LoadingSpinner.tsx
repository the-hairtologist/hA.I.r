import { Scissors } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  message?: string;
}

export const LoadingSpinner = ({ 
  size = "md", 
  className,
  message = "Loading..."
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-12 w-12",
    lg: "h-16 w-16"
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 min-h-screen w-full", className)} role="status">
      <div className="relative">
        <Scissors 
          className={cn(
            "text-primary animate-pulse",
            sizeClasses[size]
          )}
          aria-hidden="true"
        />
        <div className={cn(
          "absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin",
          sizeClasses[size]
        )} />
      </div>
      <p className="text-muted-foreground font-medium">
        <span className="sr-only">{message}</span>
        <span aria-hidden="true">{message}</span>
      </p>
    </div>
  );
};

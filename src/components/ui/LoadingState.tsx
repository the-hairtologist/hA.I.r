import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton, SkeletonCard, SkeletonList } from "./Skeleton";

interface LoadingStateProps {
  type?: "spinner" | "skeleton" | "list";
  message?: string;
  className?: string;
  count?: number;
}

export const LoadingState = ({ 
  type = "spinner", 
  message,
  className,
  count = 3,
}: LoadingStateProps) => {
  if (type === "list") {
    return <SkeletonList count={count} />;
  }

  if (type === "skeleton") {
    return <SkeletonCard className={className} />;
  }

  return (
    <div className={cn("flex flex-col items-center justify-center p-8 space-y-3", className)}>
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      {message && (
        <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
      )}
    </div>
  );
};

export const InlineLoader = ({ message }: { message?: string }) => (
  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    <Loader2 className="h-4 w-4 animate-spin" />
    {message && <span>{message}</span>}
  </div>
);

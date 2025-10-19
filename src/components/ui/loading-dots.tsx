import { cn } from "@/lib/utils";

interface LoadingDotsProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const LoadingDots = ({ className, size = "md" }: LoadingDotsProps) => {
  const sizeClasses = {
    sm: "h-1 w-1",
    md: "h-2 w-2",
    lg: "h-3 w-3"
  };

  return (
    <div className={cn("flex items-center gap-1", className)} role="status" aria-label="Loading">
      <span className={cn("rounded-full bg-current animate-bounce", sizeClasses[size])} style={{ animationDelay: "0ms" }} />
      <span className={cn("rounded-full bg-current animate-bounce", sizeClasses[size])} style={{ animationDelay: "150ms" }} />
      <span className={cn("rounded-full bg-current animate-bounce", sizeClasses[size])} style={{ animationDelay: "300ms" }} />
    </div>
  );
};
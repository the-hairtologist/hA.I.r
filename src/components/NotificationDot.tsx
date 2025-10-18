import { cn } from "@/lib/utils";

interface NotificationDotProps {
  count?: number;
  show?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const NotificationDot = ({ 
  count, 
  show = true, 
  size = "md",
  className 
}: NotificationDotProps) => {
  if (!show) return null;

  const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-2.5 w-2.5",
    lg: "h-4 w-4 sm:h-5 sm:w-5",
  };

  const badgeSizeClasses = {
    sm: "h-6 min-w-6 text-xs px-1.5",
    md: "h-7 min-w-7 text-sm px-2",
    lg: "h-8 min-w-8 text-sm px-2.5",
  };

  if (count !== undefined && count > 0) {
    return (
      <span
        className={cn(
          "absolute -top-1 -right-1 flex items-center justify-center rounded-full",
          "bg-destructive text-destructive-foreground font-bold",
          "border-2 border-background",
          "animate-pulse",
          badgeSizeClasses[size],
          className
        )}
      >
        {count > 99 ? "99+" : count}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "absolute -top-0.5 -right-0.5 rounded-full",
        "bg-destructive",
        "border-2 border-background",
        "animate-pulse",
        sizeClasses[size],
        className
      )}
    />
  );
};

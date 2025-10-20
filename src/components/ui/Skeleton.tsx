import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "card" | "avatar" | "button";
}

export const Skeleton = ({ 
  className, 
  variant = "text",
  ...props 
}: SkeletonProps) => {
  const variants = {
    text: "h-4 w-full rounded",
    card: "h-32 w-full rounded-lg",
    avatar: "h-12 w-12 rounded-full",
    button: "h-10 w-24 rounded-md",
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-muted/50",
        variants[variant],
        className
      )}
      {...props}
    />
  );
};

export const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={cn("brutal-border p-4 sm:p-6 space-y-3", className)}>
    <Skeleton variant="text" className="w-3/4" />
    <Skeleton variant="text" className="w-1/2" />
    <Skeleton variant="text" />
  </div>
);

export const SkeletonList = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

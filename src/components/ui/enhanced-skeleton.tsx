import { cn } from "@/lib/utils";

interface EnhancedSkeletonProps {
  variant?: "brutal" | "glass" | "elevated";
  className?: string;
}

export function EnhancedSkeleton({ variant = "brutal", className }: EnhancedSkeletonProps) {
  return (
    <div
      className={cn(
        "shimmer rounded-lg",
        variant === "brutal" && "border-2 border-foreground/20",
        variant === "glass" && "glass-brutal",
        variant === "elevated" && "elevation-1",
        className
      )}
      role="status"
      aria-label="Loading content"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

interface SkeletonCardProps {
  variant?: "brutal" | "glass" | "elevated";
  hasImage?: boolean;
  hasActions?: boolean;
}

export function SkeletonCard({ variant = "brutal", hasImage = false, hasActions = false }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl overflow-hidden",
        variant === "brutal" && "border-[3px] border-foreground/20 shadow-[4px_4px_0px_0px_hsl(var(--foreground)/0.1)]",
        variant === "glass" && "glass-brutal",
        variant === "elevated" && "elevation-2"
      )}
      role="status"
      aria-label="Loading card"
    >
      {hasImage && <EnhancedSkeleton variant={variant} className="h-48 w-full rounded-none" />}
      
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <EnhancedSkeleton variant={variant} className="h-6 w-3/4" />
          <EnhancedSkeleton variant={variant} className="h-4 w-full" />
          <EnhancedSkeleton variant={variant} className="h-4 w-5/6" />
        </div>
        
        {hasActions && (
          <div className="flex gap-3 pt-2">
            <EnhancedSkeleton variant={variant} className="h-10 w-24" />
            <EnhancedSkeleton variant={variant} className="h-10 w-24" />
          </div>
        )}
      </div>
    </div>
  );
}

interface SkeletonStatProps {
  variant?: "brutal" | "glass" | "elevated";
}

export function SkeletonStat({ variant = "brutal" }: SkeletonStatProps) {
  return (
    <div
      className={cn(
        "rounded-xl overflow-hidden",
        variant === "brutal" && "border-[3px] border-foreground/20 shadow-[4px_4px_0px_0px_hsl(var(--foreground)/0.1)]",
        variant === "glass" && "glass-brutal",
        variant === "elevated" && "elevation-2"
      )}
      role="status"
      aria-label="Loading statistic"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <EnhancedSkeleton variant={variant} className="h-12 w-12 rounded-xl" />
        </div>
        <div className="space-y-2">
          <EnhancedSkeleton variant={variant} className="h-4 w-24" />
          <EnhancedSkeleton variant={variant} className="h-8 w-16" />
        </div>
      </div>
    </div>
  );
}

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  variant?: "brutal" | "glass" | "elevated";
}

export function SkeletonTable({ rows = 5, columns = 4, variant = "brutal" }: SkeletonTableProps) {
  return (
    <div
      className={cn(
        "rounded-xl overflow-hidden",
        variant === "brutal" && "border-[3px] border-foreground/20",
        variant === "glass" && "glass-brutal",
        variant === "elevated" && "elevation-2"
      )}
      role="status"
      aria-label="Loading table"
    >
      {/* Header */}
      <div className="grid gap-4 p-4 border-b-2 border-foreground/10" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <EnhancedSkeleton key={`header-${i}`} variant={variant} className="h-5 w-full" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          className="grid gap-4 p-4 border-b border-foreground/5"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <EnhancedSkeleton key={`cell-${rowIndex}-${colIndex}`} variant={variant} className="h-4 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}

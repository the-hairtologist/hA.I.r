import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ListSkeletonProps {
  items?: number;
  variant?: 'compact' | 'detailed' | 'grid';
  className?: string;
}

export const ListSkeleton = ({ 
  items = 3, 
  variant = 'compact',
  className = '' 
}: ListSkeletonProps) => {
  if (variant === 'grid') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 ${className}`}>
        {[...Array(items)].map((_, i) => (
          <Card key={i} className="animate-fade-in shimmer" style={{ animationDelay: `${i * 50}ms` }}>
            <CardHeader>
              <Skeleton className="h-5 w-3/4 shimmer" />
              <Skeleton className="h-4 w-1/2 shimmer" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2 shimmer" />
              <Skeleton className="h-4 w-5/6 shimmer" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(items)].map((_, i) => (
          <Card key={i} className="animate-fade-in shimmer" style={{ animationDelay: `${i * 50}ms` }}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Skeleton className="h-16 w-16 rounded-lg shrink-0 shimmer" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-5 w-2/3 shimmer" />
                  <Skeleton className="h-4 w-full shimmer" />
                  <Skeleton className="h-4 w-4/5 shimmer" />
                  <div className="flex gap-2 mt-3">
                    <Skeleton className="h-8 w-20 shimmer" />
                    <Skeleton className="h-8 w-20 shimmer" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Compact variant (default)
  return (
    <div className={`space-y-2 ${className}`}>
      {[...Array(items)].map((_, i) => (
        <Card key={i} className="animate-fade-in shimmer" style={{ animationDelay: `${i * 50}ms` }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full shrink-0 shimmer" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2 shimmer" />
                <Skeleton className="h-3 w-3/4 shimmer" />
              </div>
              <Skeleton className="h-8 w-16 shimmer" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) => (
  <div className="space-y-3 animate-fade-in">
    {/* Header */}
    <div className="flex gap-4 pb-3 border-b">
      {[...Array(columns)].map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1 shimmer" />
      ))}
    </div>
    {/* Rows */}
    {[...Array(rows)].map((_, rowIndex) => (
      <div key={rowIndex} className="flex gap-4 py-3" style={{ animationDelay: `${rowIndex * 50}ms` }}>
        {[...Array(columns)].map((_, colIndex) => (
          <Skeleton key={colIndex} className="h-4 flex-1 shimmer" />
        ))}
      </div>
    ))}
  </div>
);

/**
 * Card Skeleton Component
 * Skeleton loader for card-based layouts
 */

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface CardSkeletonProps {
  count?: number;
  showImage?: boolean;
  showActions?: boolean;
}

export const CardSkeleton = ({
  count = 3,
  showImage = true,
  showActions = true,
}: CardSkeletonProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card
          key={`card-skeleton-${i}`}
          className="border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] animate-fade-in"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          {showImage && (
            <Skeleton className="h-48 w-full rounded-t-none border-b-[3px] border-foreground" />
          )}
          <CardHeader className="space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            {showActions && (
              <div className="flex gap-2 mt-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

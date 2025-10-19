/**
 * Skeleton Card Component
 * Loading placeholder for card-based layouts
 */

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface SkeletonCardProps {
  showImage?: boolean;
  showActions?: boolean;
}

export const SkeletonCard = ({ showImage = true, showActions = false }: SkeletonCardProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showImage && <Skeleton className="h-48 w-full rounded-md" />}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
        {showActions && (
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const SkeletonCardGrid = ({ count = 3 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};

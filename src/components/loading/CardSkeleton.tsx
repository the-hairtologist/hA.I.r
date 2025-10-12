/**
 * Card Skeleton Loader
 * Displays a skeleton UI while card content is loading
 */

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

interface CardSkeletonProps {
  count?: number;
  showImage?: boolean;
  showHeader?: boolean;
}

export const CardSkeleton = ({ 
  count = 3,
  showImage = false,
  showHeader = true
}: CardSkeletonProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={`card-skeleton-${index}`} className="w-full">
          {showHeader && (
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
          )}
          <CardContent>
            {showImage && (
              <Skeleton className="h-48 w-full mb-4 rounded-lg" />
            )}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
};

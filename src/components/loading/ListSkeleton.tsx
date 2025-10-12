/**
 * List Skeleton Loader
 * Displays a skeleton UI for list items
 */

import { Skeleton } from "@/components/ui/skeleton";

interface ListSkeletonProps {
  items?: number;
  showAvatar?: boolean;
  showActions?: boolean;
}

export const ListSkeleton = ({ 
  items = 5,
  showAvatar = true,
  showActions = true
}: ListSkeletonProps) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, index) => (
        <div 
          key={`list-skeleton-${index}`}
          className="flex items-center gap-4 p-4 border rounded-lg"
        >
          {showAvatar && (
            <Skeleton className="h-12 w-12 rounded-full" />
          )}
          
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          
          {showActions && (
            <div className="flex gap-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

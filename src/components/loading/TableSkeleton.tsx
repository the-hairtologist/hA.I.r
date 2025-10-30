/**
 * Table Skeleton Loader
 * Displays a skeleton UI while table data is loading
 */

import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}

export const TableSkeleton = ({
  rows = 5,
  columns = 4,
  showHeader = true,
}: TableSkeletonProps) => {
  return (
    <Card className="w-full">
      <div className="p-4 space-y-4">
        {showHeader && (
          <div className="flex gap-4">
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton key={`header-${i}`} className="h-4 flex-1" />
            ))}
          </div>
        )}

        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={`row-${rowIndex}`} className="flex gap-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton
                  key={`cell-${rowIndex}-${colIndex}`}
                  className="h-12 flex-1"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

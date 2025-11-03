/**
 * Message Thread Skeleton - Loading placeholder for message threads
 */

import { Skeleton } from '@/components/ui/skeleton';

export const MessageThreadSkeleton = () => {
  return (
    <div className="space-y-4 p-4">
      {/* Received message */}
      <div className="flex items-start gap-3">
        <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
        <div className="space-y-2 flex-1 max-w-xs">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>

      {/* Sent message */}
      <div className="flex items-start gap-3 justify-end">
        <div className="space-y-2 flex-1 max-w-xs">
          <Skeleton className="h-12 w-full rounded-lg ml-auto" />
          <Skeleton className="h-3 w-16 ml-auto" />
        </div>
      </div>

      {/* Received message */}
      <div className="flex items-start gap-3">
        <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
        <div className="space-y-2 flex-1 max-w-xs">
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  );
};

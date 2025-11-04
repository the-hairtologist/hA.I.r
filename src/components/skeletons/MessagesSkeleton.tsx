/**
 * Messages Skeleton Component
 * Loading skeleton for messages page
 */

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export const MessagesSkeleton = () => {
  return (
    <div className="flex h-full gap-4">
      {/* Conversation List Skeleton */}
      <Card className="w-80 border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
        <CardContent className="p-4 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`conversation-${i}`}
              className="flex gap-3 animate-fade-in"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Chat Area Skeleton */}
      <Card className="flex-1 border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
        <CardContent className="p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={`message-${i}`}
              className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'} animate-fade-in`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <Skeleton
                className={`h-16 ${i % 2 === 0 ? 'w-2/3' : 'w-1/2'} rounded-lg`}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

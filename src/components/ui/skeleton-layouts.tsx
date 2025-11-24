/**
 * Pre-built Skeleton Layouts for Common UI Patterns
 * Provides instant visual feedback while data loads
 */

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const DashboardCardSkeleton = () => (
  <Card>
    <CardHeader className="space-y-2">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-4 w-full" />
    </CardContent>
  </Card>
);

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-10 w-32" />
    </div>
    <div className="border rounded-lg">
      <div className="p-4 border-b bg-muted/50">
        <div className="flex gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-4 w-24" />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 border-b last:border-0">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const ProfileSkeleton = () => (
  <Card>
    <CardHeader>
      <div className="flex items-center gap-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export const ListItemSkeleton = () => (
  <div className="flex items-center gap-4 p-4 border rounded-lg">
    <Skeleton className="h-12 w-12 rounded-full" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-3 w-1/2" />
    </div>
    <Skeleton className="h-8 w-20" />
  </div>
);

export const GridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <Card key={i}>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <div className="flex gap-2 mt-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-10" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export const FormSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
    </CardHeader>
    <CardContent className="space-y-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex gap-2">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
    </CardContent>
  </Card>
);

export const ChartSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-1/3" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-64 w-full" />
    </CardContent>
  </Card>
);

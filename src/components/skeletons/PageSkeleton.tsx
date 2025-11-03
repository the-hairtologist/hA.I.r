import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const PageHeaderSkeleton = () => (
  <div className="mb-8 animate-fade-in">
    <div className="flex items-center justify-between mb-4">
      <div className="space-y-2 flex-1">
        <Skeleton className="h-8 w-64 shimmer" />
        <Skeleton className="h-4 w-96 shimmer" />
      </div>
      <Skeleton className="h-10 w-32 shimmer" />
    </div>
  </div>
);

export const StatsSkeleton = ({ count = 4 }: { count?: number }) => (
  <div
    className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${count} gap-6 mb-8`}
  >
    {[...Array(count)].map((_, i) => (
      <Card
        key={i}
        className="animate-fade-in shimmer"
        style={{ animationDelay: `${i * 50}ms` }}
      >
        <CardHeader className="pb-3">
          <Skeleton className="h-4 w-24 mb-2 shimmer" />
          <Skeleton className="h-8 w-20 shimmer" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-3 w-32 shimmer" />
        </CardContent>
      </Card>
    ))}
  </div>
);

export const ChartSkeleton = ({ title }: { title?: string }) => (
  <Card className="animate-fade-in shimmer">
    <CardHeader>
      {title ? (
        <Skeleton className="h-6 w-48 shimmer" />
      ) : (
        <>
          <Skeleton className="h-6 w-48 mb-2 shimmer" />
          <Skeleton className="h-4 w-64 shimmer" />
        </>
      )}
    </CardHeader>
    <CardContent>
      <Skeleton className="h-[300px] w-full shimmer" />
    </CardContent>
  </Card>
);

export const AnalyticsPageSkeleton = () => (
  <div className="space-y-8 animate-fade-in">
    <PageHeaderSkeleton />
    <StatsSkeleton count={4} />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartSkeleton title="Revenue Trends" />
      <ChartSkeleton title="Client Growth" />
    </div>
    <ChartSkeleton title="Performance Overview" />
  </div>
);

export const FormPageSkeleton = () => (
  <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
    <PageHeaderSkeleton />
    <Card className="shimmer">
      <CardContent className="pt-6 space-y-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-32 shimmer" />
            <Skeleton className="h-10 w-full shimmer" />
          </div>
        ))}
        <div className="flex justify-end gap-3 pt-4">
          <Skeleton className="h-10 w-24 shimmer" />
          <Skeleton className="h-10 w-24 shimmer" />
        </div>
      </CardContent>
    </Card>
  </div>
);

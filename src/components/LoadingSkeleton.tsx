import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export const AppointmentSkeleton = () => (
  <Card className="animate-fade-in shimmer">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <Skeleton className="h-12 w-12 rounded-lg shimmer" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-32 shimmer" />
            <Skeleton className="h-3 w-48 shimmer" />
          </div>
        </div>
        <Skeleton className="h-6 w-20 shimmer" />
      </div>
    </CardContent>
  </Card>
);

export const ClientCardSkeleton = () => (
  <Card className="animate-fade-in shimmer">
    <CardHeader>
      <Skeleton className="h-6 w-40 shimmer" />
    </CardHeader>
    <CardContent className="space-y-2">
      <Skeleton className="h-4 w-full shimmer" />
      <Skeleton className="h-4 w-3/4 shimmer" />
      <Skeleton className="h-4 w-1/2 shimmer" />
    </CardContent>
  </Card>
);

export const PortfolioSkeleton = () => (
  <Card className="animate-fade-in shimmer">
    <CardContent className="p-4">
      <Skeleton className="h-48 w-full rounded-lg mb-2 shimmer" />
      <Skeleton className="h-4 w-full mb-2 shimmer" />
      <div className="flex gap-2">
        <Skeleton className="h-8 flex-1 shimmer" />
        <Skeleton className="h-8 flex-1 shimmer" />
        <Skeleton className="h-8 flex-1 shimmer" />
      </div>
    </CardContent>
  </Card>
);

export const DashboardStatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {[...Array(4)].map((_, i) => (
      <Card
        key={i}
        className="animate-fade-in shimmer brutal-border brutal-shadow-xs"
        style={{ animationDelay: `${i * 50}ms` }}
      >
        <CardHeader>
          <Skeleton className="h-4 w-24 mb-2 shimmer" />
          <Skeleton className="h-8 w-16 shimmer" />
        </CardHeader>
      </Card>
    ))}
  </div>
);

export const QuickActionsSkeleton = () => (
  <Card className="mb-8 animate-fade-in shimmer brutal-border backdrop-blur-xl bg-gradient-to-br from-background/80 to-card/60">
    <CardHeader className="pb-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-5 w-5 rounded shimmer" />
            <Skeleton className="h-6 w-48 shimmer" />
            <Skeleton className="h-5 w-16 shimmer" />
          </div>
          <Skeleton className="h-4 w-64 shimmer" />
        </div>
        <Skeleton className="h-9 w-24 shimmer" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card
            key={i}
            className="brutal-border brutal-shadow-xs shimmer"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <CardContent className="p-5">
              <Skeleton className="h-12 w-12 rounded-lg mb-3 shimmer" />
              <Skeleton className="h-5 w-32 mb-2 shimmer" />
              <Skeleton className="h-4 w-40 shimmer" />
            </CardContent>
          </Card>
        ))}
      </div>
    </CardContent>
  </Card>
);

export const DashboardFullSkeleton = () => (
  <div className="space-y-8 animate-fade-in">
    <QuickActionsSkeleton />
    <DashboardStatsSkeleton />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="shimmer brutal-border brutal-shadow-xs">
        <CardHeader>
          <Skeleton className="h-6 w-40 shimmer" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full shimmer" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full shimmer" />
                <Skeleton className="h-3 w-3/4 shimmer" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card className="shimmer brutal-border brutal-shadow-xs">
        <CardHeader>
          <Skeleton className="h-6 w-40 shimmer" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full shimmer" />
              <Skeleton className="h-3 w-5/6 shimmer" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  </div>
);

export const ChatMessageSkeleton = () => (
  <div
    className="flex flex-col gap-4 animate-fade-in"
    role="status"
    aria-label="Loading chat message"
  >
    <div className="flex justify-start">
      <div className="max-w-[80%] rounded-2xl p-4 bg-muted border-2 border-border">
        <Skeleton className="h-4 w-64 mb-2 shimmer" />
        <Skeleton className="h-4 w-48 shimmer" />
      </div>
    </div>
  </div>
);

export const StylistCardSkeleton = () => (
  <Card
    className="animate-fade-in shimmer"
    role="status"
    aria-label="Loading stylist profile"
  >
    <CardContent className="p-6">
      <div className="flex gap-4">
        <Skeleton className="h-16 w-16 rounded-full shimmer" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32 shimmer" />
          <Skeleton className="h-4 w-48 shimmer" />
          <Skeleton className="h-4 w-24 shimmer" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export const FormulaSkeleton = () => (
  <Card
    className="animate-fade-in shimmer"
    role="status"
    aria-label="Loading formula"
  >
    <CardHeader>
      <Skeleton className="h-6 w-40 mb-2 shimmer" />
      <Skeleton className="h-4 w-64 shimmer" />
    </CardHeader>
    <CardContent className="space-y-3">
      <Skeleton className="h-20 w-full shimmer" />
      <Skeleton className="h-16 w-full shimmer" />
    </CardContent>
  </Card>
);

export const ServiceCardSkeleton = () => (
  <Card className="animate-fade-in shimmer">
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-6 w-3/4 shimmer" />
          <Skeleton className="h-4 w-full shimmer" />
          <Skeleton className="h-4 w-5/6 shimmer" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-6 w-20 shimmer" />
            <Skeleton className="h-6 w-16 shimmer" />
          </div>
        </div>
        <Skeleton className="h-10 w-10 rounded shimmer" />
      </div>
    </CardContent>
  </Card>
);

// Export all skeletons from new files
export * from './skeletons/ListSkeleton';
export * from './skeletons/PageSkeleton';


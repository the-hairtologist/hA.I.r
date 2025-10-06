import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

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
      <Card key={i} className="animate-fade-in shimmer" style={{ animationDelay: `${i * 50}ms` }}>
        <CardHeader>
          <Skeleton className="h-4 w-24 mb-2 shimmer" />
          <Skeleton className="h-8 w-16 shimmer" />
        </CardHeader>
      </Card>
    ))}
  </div>
);

export const ChatMessageSkeleton = () => (
  <div className="flex flex-col gap-4 animate-fade-in" role="status" aria-label="Loading chat message">
    <div className="flex justify-start">
      <div className="max-w-[80%] rounded-2xl p-4 bg-muted border-2 border-border">
        <Skeleton className="h-4 w-64 mb-2 shimmer" />
        <Skeleton className="h-4 w-48 shimmer" />
      </div>
    </div>
  </div>
);

export const StylistCardSkeleton = () => (
  <Card className="animate-fade-in shimmer" role="status" aria-label="Loading stylist profile">
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
  <Card className="animate-fade-in shimmer" role="status" aria-label="Loading formula">
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

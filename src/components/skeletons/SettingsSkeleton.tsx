/**
 * Settings Skeleton Component
 * Loading skeleton for settings page
 */

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const SettingsSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Tabs Skeleton */}
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={`tab-${i}`} className="h-10 w-24" />
        ))}
      </div>

      {/* Form Sections */}
      <Card className="brutal-border shadow-brutal-sm">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`field-${i}`}
              className="space-y-2 animate-fade-in"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-11 w-full" />
            </div>
          ))}
          <div className="flex gap-3 pt-4">
            <Skeleton className="h-11 w-32" />
            <Skeleton className="h-11 w-24" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

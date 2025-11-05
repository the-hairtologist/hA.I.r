/**
 * Form Skeleton Component
 * Loading skeleton for form layouts
 */

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface FormSkeletonProps {
  fieldCount?: number;
  showSubmit?: boolean;
}

export const FormSkeleton = ({
  fieldCount = 5,
  showSubmit = true,
}: FormSkeletonProps) => {
  return (
    <Card className="brutal-border shadow-brutal-sm">
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="space-y-6">
        {Array.from({ length: fieldCount }).map((_, i) => (
          <div
            key={`form-field-${i}`}
            className="space-y-2 animate-fade-in"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-11 w-full" />
          </div>
        ))}
        {showSubmit && (
          <div className="flex gap-3 pt-4">
            <Skeleton className="h-11 w-32" />
            <Skeleton className="h-11 w-24" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

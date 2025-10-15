/**
 * Async Error Boundary
 * Catches errors from async operations and lazy-loaded components
 */

import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { RouteErrorBoundary } from './RouteErrorBoundary';

interface Props {
  children: React.ReactNode;
  loadingFallback?: React.ReactNode;
}

const DefaultLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[min(60vh,400px)]">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

export const AsyncErrorBoundary: React.FC<Props> = ({ 
  children, 
  loadingFallback = <DefaultLoadingFallback /> 
}) => {
  return (
    <RouteErrorBoundary>
      <Suspense fallback={loadingFallback}>
        {children}
      </Suspense>
    </RouteErrorBoundary>
  );
};

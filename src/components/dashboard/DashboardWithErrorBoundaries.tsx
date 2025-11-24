/**
 * Dashboard with Feature Error Boundaries
 * Wraps each dashboard section in isolation
 */

import { FeatureErrorBoundary } from '@/components/errors/FeatureErrorBoundary';
import { ReactNode } from 'react';

interface SectionWrapperProps {
  name: string;
  children: ReactNode;
}

export const DashboardSection = ({ name, children }: SectionWrapperProps) => {
  return (
    <FeatureErrorBoundary featureName={name}>{children}</FeatureErrorBoundary>
  );
};

// Export wrapped versions of dashboard components
export { DashboardSection as ErrorBoundedSection };

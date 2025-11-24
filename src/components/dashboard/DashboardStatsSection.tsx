/**
 * Dashboard Stats Section Component
 * Extracted from Dashboard.tsx for better performance and maintainability
 */

import { memo } from 'react';
import { DashboardStats } from './DashboardStats';

interface DashboardStatsSectionProps {
  stats: any;
  userRole: string | null;
}

export const DashboardStatsSection = memo(
  ({ stats, userRole }: DashboardStatsSectionProps) => {
    if (!stats) return null;

    return (
      <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
        <DashboardStats stats={stats} userRole={userRole ?? ''} />
      </div>
    );
  }
);

DashboardStatsSection.displayName = 'DashboardStatsSection';

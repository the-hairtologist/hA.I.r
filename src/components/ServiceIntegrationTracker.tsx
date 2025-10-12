import { useEffect } from 'react';
import { useErrorTracking } from '@/hooks/useErrorTracking';
import { performanceTracker } from '@/lib/monitoring/PerformanceTracker';

/**
 * Global service integration tracker
 * Initializes all monitoring and tracking services
 */
export const ServiceIntegrationTracker = () => {
  // Error tracking
  useErrorTracking();

  useEffect(() => {
    // Initialize performance tracking
    performanceTracker.initialize();

    console.log('[Services] All integrations initialized');
  }, []);

  return null;
};

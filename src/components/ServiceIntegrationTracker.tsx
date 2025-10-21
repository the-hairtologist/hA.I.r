import { useEffect } from 'react';
import { useErrorTracking } from '@/hooks/useErrorTracking';
import { performanceTracker } from '@/lib/monitoring/PerformanceTracker';
import { logger } from '@/lib/logger';

/**
 * Global service integration tracker
 * Initializes all monitoring, tracking, and self-healing services
 */
export const ServiceIntegrationTracker = () => {
  // Error tracking
  useErrorTracking();

  useEffect(() => {
    // Initialize all systems
    const init = async () => {
      try {
        performanceTracker.initialize();
        logger.info('[Services] All integrations initialized');
      } catch (error) {
        logger.error('[Services] Failed to initialize integrations', 'ServiceIntegrationTracker', error);
      }
    };

    init();
  }, []);

  return null;
};

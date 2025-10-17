import { useEffect } from 'react';
import { useErrorTracking } from '@/hooks/useErrorTracking';
import { performanceTracker } from '@/lib/monitoring/PerformanceTracker';
import { selfHealing } from '@/lib/selfHealing';
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
      performanceTracker.initialize();
      await selfHealing.initialize();
      
      logger.info('[Services] All integrations initialized');
    };

    init();

    // Cleanup on unmount
    return () => {
      selfHealing.shutdown();
    };
  }, []);

  return null;
};

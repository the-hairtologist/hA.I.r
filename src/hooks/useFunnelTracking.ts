/**
 * Funnel Tracking Hook
 * React hook for tracking user progression through funnels
 */

import { useCallback, useEffect } from 'react';
import { funnelTracker } from '@/lib/analytics/funnelTracker';

export function useFunnelTracking(funnelName: string) {
  /**
   * Start tracking a funnel
   */
  const startFunnel = useCallback((metadata?: Record<string, any>) => {
    funnelTracker.startFunnel(funnelName, metadata);
  }, [funnelName]);

  /**
   * Track step completion
   */
  const completeStep = useCallback((stepName: string, stepOrder: number, metadata?: Record<string, any>) => {
    funnelTracker.completeStep({
      funnelName,
      stepName,
      stepOrder,
      metadata,
    });
  }, [funnelName]);

  /**
   * Track funnel abandonment
   */
  const abandonFunnel = useCallback((stepName: string, stepOrder: number, metadata?: Record<string, any>) => {
    funnelTracker.abandonFunnel({
      funnelName,
      stepName,
      stepOrder,
      metadata,
    });
  }, [funnelName]);

  /**
   * Complete entire funnel
   */
  const completeFunnel = useCallback((metadata?: Record<string, any>) => {
    funnelTracker.completeFunnel(funnelName, metadata);
  }, [funnelName]);

  /**
   * Track abandonment on component unmount
   */
  useEffect(() => {
    return () => {
      // Optional: track abandonment when component unmounts
      // This can be enabled per-funnel as needed
    };
  }, []);

  return {
    startFunnel,
    completeStep,
    abandonFunnel,
    completeFunnel,
  };
}

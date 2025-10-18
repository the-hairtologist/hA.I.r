/**
 * Mobile Analytics Hook with Lovable Cloud Integration
 * Tracks mobile optimization metrics and user preferences
 */

import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Platform } from '@/platform/detector';

interface MobileMetrics {
  device_type: string;
  viewport_width: number;
  viewport_height: number;
  safe_area_top: number;
  safe_area_bottom: number;
  performance_score?: number;
  interaction_latency_ms?: number;
  offline_events_count?: number;
}

export const useMobileAnalytics = () => {
  const trackMetrics = useCallback(async (metrics: Partial<MobileMetrics>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fullMetrics: MobileMetrics = {
        device_type: Platform.isIOS ? 'ios' : Platform.isAndroid ? 'android' : 'web',
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight,
        safe_area_top: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-top') || '0'),
        safe_area_bottom: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom') || '0'),
        ...metrics,
      };

      await supabase.from('mobile_optimization_metrics').insert({
        user_id: user.id,
        ...fullMetrics,
      });
    } catch (error) {
      console.error('Failed to track mobile metrics:', error);
    }
  }, []);

  const logError = useCallback(async (error: Error, context?: Record<string, any>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      await supabase.from('mobile_error_logs').insert({
        user_id: user?.id,
        error_type: error.name,
        error_message: error.message,
        stack_trace: error.stack,
        device_info: {
          platform: Platform.isIOS ? 'ios' : Platform.isAndroid ? 'android' : 'web',
          userAgent: navigator.userAgent,
          ...context,
        },
        viewport_size: `${window.innerWidth}x${window.innerHeight}`,
      });
    } catch (err) {
      console.error('Failed to log mobile error:', err);
    }
  }, []);

  // Track initial load metrics
  useEffect(() => {
    const trackInitialLoad = async () => {
      // Wait for page to be fully loaded
      if (document.readyState === 'complete') {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const loadTime = perfData?.loadEventEnd - perfData?.fetchStart;

        await trackMetrics({
          performance_score: loadTime ? Math.round(loadTime) : undefined,
        });
      }
    };

    if (document.readyState === 'complete') {
      trackInitialLoad();
    } else {
      window.addEventListener('load', trackInitialLoad);
      return () => window.removeEventListener('load', trackInitialLoad);
    }
  }, [trackMetrics]);

  return {
    trackMetrics,
    logError,
  };
};

export default useMobileAnalytics;
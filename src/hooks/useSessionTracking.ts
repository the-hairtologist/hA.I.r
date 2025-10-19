/**
 * Session Tracking Hook
 * Tracks user session duration, page views, and events
 */

import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';
import { logger } from '@/lib/logger';

export function useSessionTracking() {
  const location = useLocation();
  const sessionIdRef = useRef<string>('');
  const sessionStartRef = useRef<number>(0);
  const pageViewsRef = useRef<number>(0);

  useEffect(() => {
    // Generate session ID on mount
    sessionIdRef.current = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStartRef.current = Date.now();

    const startSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;

        const { error } = await supabase
          .from('user_sessions')
          .insert({
            user_id: user.id,
            session_id: sessionIdRef.current,
            started_at: new Date().toISOString(),
            entry_page: window.location.pathname,
            device_type: getDeviceType(),
            platform: navigator.platform,
          });

        if (error) throw error;

        logger.debug('[SessionTracker] Session started', 'sessionTracker');
      } catch (error) {
        logger.error('[SessionTracker] Failed to start session', 'sessionTracker', error);
      }
    };

    const endSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;

        const duration = Math.floor((Date.now() - sessionStartRef.current) / 1000);

        const { error } = await supabase
          .from('user_sessions')
          .update({
            ended_at: new Date().toISOString(),
            duration_seconds: duration,
            exit_page: window.location.pathname,
            page_views: pageViewsRef.current,
          })
          .eq('session_id', sessionIdRef.current);

        if (error) throw error;

        logger.debug('[SessionTracker] Session ended', 'sessionTracker');
      } catch (error) {
        logger.error('[SessionTracker] Failed to end session', 'sessionTracker', error);
      }
    };

    startSession();

    // End session on page unload
    window.addEventListener('beforeunload', endSession);

    return () => {
      endSession();
      window.removeEventListener('beforeunload', endSession);
    };
  }, []);

  // Track page views
  useEffect(() => {
    pageViewsRef.current += 1;

    const updatePageViews = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;

        await supabase
          .from('user_sessions')
          .update({
            page_views: pageViewsRef.current,
          })
          .eq('session_id', sessionIdRef.current);
      } catch (error) {
        logger.error('[SessionTracker] Failed to update page views', 'sessionTracker', error);
      }
    };

    updatePageViews();
  }, [location.pathname]);

  return {
    sessionId: sessionIdRef.current,
  };
}

function getDeviceType(): string {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

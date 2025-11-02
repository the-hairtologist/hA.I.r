/**
 * Event Tracker Service
 * Unified event tracking with automatic session management
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface TrackEventParams {
  eventName: string;
  eventCategory: string;
  eventData?: Record<string, any>;
  userId?: string;
  userRole?: string;
}

class EventTracker {
  private sessionId: string;
  private eventQueue: any[] = [];
  private flushInterval: number = 30000; // 30 seconds
  private maxQueueSize: number = 50;
  private flushTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startFlushTimer();
    this.setupUnloadHandler();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private startFlushTimer() {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  private setupUnloadHandler() {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flush(true);
      });
    }
  }

  /**
   * Track an event with automatic batching
   */
  async track(params: TrackEventParams) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const event = {
      user_id: params.userId || user?.id,
      session_id: this.sessionId,
      event_name: params.eventName,
      event_category: params.eventCategory,
      event_data: params.eventData || {},
      page_path: window.location.pathname,
      referrer: document.referrer,
      user_role: params.userRole,
      device_type: this.getDeviceType(),
      platform: navigator.platform,
      utm_source: this.getUTMParam('utm_source'),
      utm_medium: this.getUTMParam('utm_medium'),
      utm_campaign: this.getUTMParam('utm_campaign'),
    };

    this.eventQueue.push(event);

    if (import.meta.env.DEV) {
      logger.debug('[EventTracker]', params.eventName, params.eventData);
    }

    // Flush if queue is full
    if (this.eventQueue.length >= this.maxQueueSize) {
      await this.flush();
    }
  }

  /**
   * Track page view
   */
  async trackPageView(pageName?: string) {
    await this.track({
      eventName: 'page_viewed',
      eventCategory: 'navigation',
      eventData: {
        page_name: pageName || document.title,
        path: window.location.pathname,
      },
    });
  }

  /**
   * Flush queued events to database
   */
  private async flush(sync = false) {
    if (this.eventQueue.length === 0) return;

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Only insert if user is authenticated
      if (user) {
        if (sync && navigator.sendBeacon) {
          // Use sendBeacon for synchronous sends on page unload
          const blob = new Blob([JSON.stringify({ events: eventsToSend })], {
            type: 'application/json',
          });
          navigator.sendBeacon('/api/analytics', blob);
        } else {
          const { error } = await supabase
            .from('user_events')
            .insert(eventsToSend);

          if (error) throw error;

          logger.debug(
            `[EventTracker] Flushed ${eventsToSend.length} events`,
            'eventTracker'
          );
        }
      }
    } catch (error) {
      logger.error(
        '[EventTracker] Failed to flush events',
        'eventTracker',
        error
      );
      // Re-queue on failure
      this.eventQueue.unshift(...eventsToSend);
    }
  }

  /**
   * Get UTM parameter from URL
   */
  private getUTMParam(param: string): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }

  /**
   * Get device type
   */
  private getDeviceType(): string {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    if (
      /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
        ua
      )
    ) {
      return 'mobile';
    }
    return 'desktop';
  }

  /**
   * Destroy tracker and clear timer
   */
  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
  }
}

export const eventTracker = new EventTracker();

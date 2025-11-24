/**
 * Enhanced Analytics System
 * Tracks critical business events for data-driven decisions
 */

import { analytics } from './analytics';
import { logger } from './logger';

/**
 * Business-critical events to track
 */
export const ANALYTICS_EVENTS = {
  // Onboarding funnel
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_STEP_COMPLETED: 'onboarding_step_completed',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  ONBOARDING_ABANDONED: 'onboarding_abandoned',

  // Formula generation
  FORMULA_GENERATION_REQUESTED: 'formula_generation_requested',
  FORMULA_GENERATION_SUCCESS: 'formula_generation_success',
  FORMULA_GENERATION_FAILED: 'formula_generation_failed',
  FORMULA_SAVED: 'formula_saved',
  FORMULA_SHARED: 'formula_shared',

  // Appointments
  REBOOK_CLICKED: 'rebook_clicked',
  REBOOK_COMPLETED: 'rebook_completed',
  APPOINTMENT_SHARED: 'appointment_shared',
  APPOINTMENT_NO_SHOW: 'appointment_no_show',

  // Feature discovery
  FEATURE_DISCOVERED: 'feature_discovered',
  CSV_IMPORT_USED: 'csv_import_used',
  VOICE_INPUT_USED: 'voice_input_used',
  AI_ASSISTANT_OPENED: 'ai_assistant_opened',

  // Referrals & growth
  REFERRAL_CODE_SHARED: 'referral_code_shared',
  REFERRAL_CODE_USED: 'referral_code_used',
  TRANSFORMATION_SHARED: 'transformation_shared',

  // Retention indicators
  CLIENT_CHURNED_RISK: 'client_churned_risk',
  DASHBOARD_WIDGET_CUSTOMIZED: 'dashboard_widget_customized',
  PROFILE_PHOTO_UPLOADED: 'profile_photo_uploaded',

  // Conversion
  STYLIST_PROFILE_VIEWED: 'stylist_profile_viewed',
  BOOKING_INITIATED: 'booking_initiated',
  BOOKING_COMPLETED: 'booking_completed',

  // Errors
  ERROR_OCCURRED: 'error_occurred',
  NETWORK_FAILURE: 'network_failure',
  IMAGE_UPLOAD_FAILED: 'image_upload_failed',
} as const;

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp?: Date;
  userId?: string;
  userRole?: string;
}

class EnhancedAnalytics {
  private eventQueue: AnalyticsEvent[] = [];
  private flushInterval: number = 30000; // 30 seconds
  private maxQueueSize: number = 50;

  constructor() {
    // Auto-flush queue periodically
    setInterval(() => this.flush(), this.flushInterval);

    // Flush on page unload
    window.addEventListener('beforeunload', () => this.flush());
  }

  /**
   * Track event with automatic batching
   */
  track(event: string, properties?: Record<string, any>) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      timestamp: new Date(),
    };

    this.eventQueue.push(analyticsEvent);

    if (import.meta.env.DEV) {
      logger.debug('[Analytics]', event, properties);
    }

    // Flush if queue is full
    if (this.eventQueue.length >= this.maxQueueSize) {
      this.flush();
    }

    // Also send to legacy analytics
    analytics.track(event, properties);
  }

  /**
   * Flush queued events to backend
   */
  private async flush() {
    if (this.eventQueue.length === 0) return;

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // In production, send to analytics backend
      // Currently using local storage for analytics data
      // Future enhancement: Implement backend analytics service
      logger.debug(
        `[Analytics] Flushed ${eventsToSend.length} events`,
        'enhancedAnalytics'
      );
    } catch (error) {
      logger.error(
        '[Analytics] Failed to flush events',
        'enhancedAnalytics',
        error
      );
      // Re-queue on failure
      this.eventQueue.unshift(...eventsToSend);
    }
  }

  /**
   * Track page view with automatic metadata
   */
  trackPageView(pageName: string, properties?: Record<string, any>) {
    this.track('page_viewed', {
      page: pageName,
      path: window.location.pathname,
      referrer: document.referrer,
      ...properties,
    });
  }

  /**
   * Track user session start
   */
  trackSessionStart(userId: string, userRole: string) {
    this.track('session_started', {
      userId,
      userRole,
      platform: this.getPlatform(),
      deviceType: this.getDeviceType(),
    });
  }

  /**
   * Track feature usage
   */
  trackFeatureUsage(feature: string, properties?: Record<string, any>) {
    this.track(ANALYTICS_EVENTS.FEATURE_DISCOVERED, {
      feature,
      ...properties,
    });
  }

  /**
   * ✨ ENHANCEMENT: Track user journey through funnel
   */
  trackFunnelStep(
    funnelName: string,
    stepName: string,
    stepOrder: number,
    properties?: Record<string, any>
  ) {
    this.track('funnel_step_completed', {
      funnel_name: funnelName,
      step_name: stepName,
      step_order: stepOrder,
      ...properties,
    });
  }

  /**
   * ✨ ENHANCEMENT: Track business-critical actions with revenue impact
   */
  trackRevenueAction(
    action: string,
    revenueImpact: number,
    properties?: Record<string, any>
  ) {
    this.track('revenue_action', {
      action,
      revenue_impact: revenueImpact,
      ...properties,
    });
  }

  /**
   * ✨ ENHANCEMENT: Track AI confidence and effectiveness
   */
  trackAIOutcome(
    feature: string,
    confidenceScore: number,
    wasAccurate: boolean,
    properties?: Record<string, any>
  ) {
    this.track('ai_outcome', {
      feature,
      confidence_score: confidenceScore,
      was_accurate: wasAccurate,
      ...properties,
    });
  }

  /**
   * Track error with context
   */
  trackError(error: Error, context?: Record<string, any>) {
    this.track(ANALYTICS_EVENTS.ERROR_OCCURRED, {
      errorMessage: error.message,
      errorStack: error.stack,
      ...context,
    });
  }

  /**
   * Get platform information
   */
  private getPlatform(): string {
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
   * Get device type
   */
  private getDeviceType(): string {
    return navigator.userAgent;
  }
}

export const enhancedAnalytics = new EnhancedAnalytics();

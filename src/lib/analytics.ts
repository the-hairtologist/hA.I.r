/**
 * Analytics Integration for Hair A.I.
 * Supports Google Analytics 4, Mixpanel, and custom event tracking
 */

import { Platform } from '@/platform/index';
import { logger } from './logger';

// Analytics configuration - lazy loaded to prevent build-time issues
let GA4_MEASUREMENT_ID: string | null = null;
let MIXPANEL_TOKEN: string | null = null;

const getGA4Id = () => {
  if (GA4_MEASUREMENT_ID === null) {
    GA4_MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID || '';
  }
  return GA4_MEASUREMENT_ID;
};

const getMixpanelToken = () => {
  if (MIXPANEL_TOKEN === null) {
    MIXPANEL_TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN || '';
  }
  return MIXPANEL_TOKEN;
};

// Initialize analytics on app load
let analyticsInitialized = false;
let isInitialized = false;

/**
 * Validates Google Analytics Measurement ID format
 * Prevents script injection attacks
 */
const isValidGA4Id = (id: string): boolean => {
  const GA4_REGEX = /^G-[A-Z0-9]{10}$/;
  return GA4_REGEX.test(id);
};

/**
 * Initialize analytics providers
 * Call this once in your App.tsx or main.tsx
 */
export const initAnalytics = () => {
  if (analyticsInitialized) return;

  const measurementId = getGA4Id(); // Lazy load env var
  
  // Google Analytics 4 - with security validation
  if (!measurementId || !isValidGA4Id(measurementId)) {
    logger.info('GA4 not configured or invalid', 'analytics');
    analyticsInitialized = true;
    isInitialized = true;
    return;
  }

  if (Platform.isWeb) {
    // GA4 script injection
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${measurementId}', {
        send_page_view: false,
        debug_mode: ${import.meta.env.DEV}
      });
    `;
    document.head.appendChild(script2);
  }

  // Mixpanel (optional)
  const mixpanelToken = getMixpanelToken(); // Lazy load env var
  if (mixpanelToken) {
    // Add Mixpanel initialization here if needed
  }

  isInitialized = true;
  analyticsInitialized = true;
  logger.info('Analytics initialized successfully', 'analytics');
};

/**
 * Check if analytics is ready
 */
export const isAnalyticsReady = (): boolean => {
  return isInitialized;
};

/**
 * Track a page view
 */
export const trackPageView = (pagePath: string, pageTitle?: string) => {
  if (!analyticsInitialized) return;

  // Google Analytics 4
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as unknown as { gtag: (...args: any[]) => void }).gtag('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle || document.title,
      platform: Platform.platform,
    });
  }

  logger.debug('Page view tracked', 'analytics', { pagePath });
};

/**
 * Track a custom event
 */
export const trackEvent = (
  eventName: string,
  properties?: Record<string, any>
) => {
  if (!analyticsInitialized) return;

  const eventData = {
    ...properties,
    platform: Platform.platform,
    timestamp: new Date().toISOString(),
  };

  // Google Analytics 4
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as unknown as { gtag: (...args: any[]) => void }).gtag('event', eventName, eventData);
  }

  logger.debug('Event tracked', 'analytics', { eventName, eventData });
};

/**
 * Set user properties
 */
export const setUserProperties = (userId: string, properties?: Record<string, any>) => {
  if (!analyticsInitialized) return;

  // Google Analytics 4
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as unknown as { gtag: (...args: any[]) => void }).gtag('set', 'user_properties', {
      user_id: userId,
      ...properties,
    });
  }

  logger.debug('User properties set', 'analytics', { userId });
};

/**
 * Track user identification
 */
export const identifyUser = (userId: string, traits?: Record<string, any>) => {
  if (!analyticsInitialized) return;

  const measurementId = getGA4Id(); // Lazy load env var
  
  // Google Analytics 4
  if (typeof window !== 'undefined' && 'gtag' in window && measurementId) {
    (window as unknown as { gtag: (...args: any[]) => void }).gtag('config', measurementId, {
      user_id: userId,
      ...traits,
    });
  }

  logger.debug('User identified', 'analytics', { userId });
};

interface AnalyticsEvent {
  event_name: string;
  event_data?: Record<string, any>;
}

class Analytics {
  private enabled: boolean;

  constructor() {
    // Enable in both dev and prod for comprehensive tracking
    this.enabled = true;
  }

  /**
   * Track a custom event
   */
  track(eventName: string, eventData?: Record<string, any>): void {
    trackEvent(eventName, eventData);
  }

  /**
   * Track page view
   */
  pageView(path: string): void {
    this.track('page_view', { page_path: path });
  }

  /**
   * Track user signup (with optional campaign data)
   */
  signup(method: string, role: string, campaignData?: Record<string, any>): void {
    this.track('sign_up', { method, role, ...campaignData });
  }

  /**
   * Track user login
   */
  login(method: string): void {
    this.track('login', { method });
  }

  /**
   * Track appointment creation
   */
  appointmentCreated(serviceType: string): void {
    this.track('appointment_created', { service_type: serviceType });
  }

  /**
   * Track appointment completion
   */
  appointmentCompleted(serviceType: string, amount?: number): void {
    this.track('appointment_completed', { 
      service_type: serviceType,
      value: amount 
    });
  }

  /**
   * Track formula generation
   */
  formulaGeneratedWithColor(colorLine?: string): void {
    this.track('formula_generated', { color_line: colorLine });
  }

  /**
   * Track subscription purchase
   */
  purchaseStarted(plan: string, amount: number): void {
    this.track('purchase_started', { 
      plan,
      value: amount,
      currency: 'USD'
    });
  }

  /**
   * Track subscription success (with optional campaign data)
   */
  purchaseCompleted(plan: string, amount: number, campaignData?: Record<string, any>): void {
    this.track('purchase_completed', { 
      plan,
      value: amount,
      currency: 'USD',
      ...campaignData
    });
  }

  /**
   * Track feature usage
   */
  featureUsed(featureName: string): void {
    this.track('feature_used', { feature_name: featureName });
  }

  /**
   * Track errors
   */
  error(errorMessage: string, errorContext?: string): void {
    this.track('error_shown', { 
      error_message: errorMessage,
      error_context: errorContext 
    });
  }

  // AI Features
  aiChatStarted(): void {
    this.track('ai_chat_started');
  }

  aiFormulaGenerated(): void {
    this.track('ai_formula_generated');
  }

  // Conversion Events (NEW)
  profileCompleted(role: string): void {
    this.track('profile_completed', { role });
  }

  firstServiceCreated(serviceData: { name: string; price: number; duration: number }): void {
    this.track('first_service_created', serviceData);
  }

  firstClientAdded(): void {
    this.track('first_client_added');
  }

  subscriptionTrialStarted(source: string = 'dashboard'): void {
    this.track('subscription_trial_started', { source });
  }

  subscriptionConverted(plan: string, amount: number): void {
    this.track('subscription_converted', { 
      plan, 
      amount,
      currency: 'USD',
      value: amount 
    });
  }

  subscriptionCancelled(reason?: string): void {
    this.track('subscription_cancelled', { reason });
  }

  appointmentBooked(serviceType: string, amount: number, isFirst: boolean = false): void {
    this.track(isFirst ? 'first_appointment_booked' : 'appointment_booked', { 
      serviceType, 
      amount,
      currency: 'USD',
      value: amount 
    });
  }

  appointmentCancelled(reason?: string, cancelledBy?: 'client' | 'stylist'): void {
    this.track('appointment_cancelled', { reason, cancelledBy });
  }

  appointmentNoShow(): void {
    this.track('appointment_no_show');
  }

  appointmentRescheduled(): void {
    this.track('appointment_rescheduled');
  }

  formulaGenerated(formulaType: string): void {
    this.track('formula_generated', { type: formulaType });
  }

  affiliateCodeUsed(brandName: string, code: string): void {
    this.track('affiliate_code_used', { brandName, code });
  }

  commissionEarned(amount: number, productName: string): void {
    this.track('commission_earned', { 
      amount, 
      productName,
      currency: 'USD',
      value: amount 
    });
  }

  // Discovery
  stylistSearched(query: string): void {
    this.track('search', { search_term: query });
  }

  stylistViewed(stylistId: string): void {
    this.track('stylist_viewed', { stylist_id: stylistId });
  }

  // Engagement
  messagesSent(conversationId: string): void {
    this.track('message_sent', { conversation_id: conversationId });
  }

  reviewWritten(rating: number): void {
    this.track('review_written', { rating });
  }

  portfolioImageUploaded(): void {
    this.track('portfolio_upload');
  }


  // Subscriptions
  subscriptionStarted(tier: string): void {
    this.track('subscription_started', { tier });
  }

  subscriptionCanceled(tier: string): void {
    this.track('subscription_canceled', { tier });
  }

  // Micro-Conversion Tracking (Landing Page Optimizations)
  
  stickyCTAClicked(variant: string): void {
    this.track('sticky_cta_clicked', { variant });
  }

  stickyCTADismissed(variant: string): void {
    this.track('sticky_cta_dismissed', { variant });
  }

  exitIntentShown(variant: string): void {
    this.track('exit_intent_shown', { variant });
  }

  exitIntentConverted(variant: string): void {
    this.track('exit_intent_converted', { variant });
  }

  exitIntentDismissed(variant: string): void {
    this.track('exit_intent_dismissed', { variant });
  }

  scrollDepthReached(variant: string, depth: number): void {
    this.track('scroll_depth_reached', { variant, depth });
  }

  sectionViewed(variant: string, section: string): void {
    this.track('section_viewed', { variant, section });
  }

  faqExpanded(variant: string, question: string): void {
    this.track('faq_expanded', { variant, question });
  }

  featureHovered(variant: string, feature: string): void {
    this.track('feature_hovered', { variant, feature });
  }

  timeOnPage(variant: string, seconds: number): void {
    this.track('time_on_page', { variant, seconds });
  }
}

// Export singleton instance
export const analytics = new Analytics();

/**
 * Instructions for integration:
 * 
 * 1. Add Google Analytics 4 to index.html:
 * 
 * <!-- Google tag (gtag.js) -->
 * <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
 * <script>
 *   window.dataLayer = window.dataLayer || [];
 *   function gtag(){dataLayer.push(arguments);}
 *   gtag('js', new Date());
 *   gtag('config', 'G-XXXXXXXXXX');
 * </script>
 * 
 * 2. Use in components:
 * 
 * import { analytics } from '@/lib/analytics';
 * 
 * // Track page views
 * useEffect(() => {
 *   analytics.pageView(location.pathname);
 * }, [location]);
 * 
 * // Track events
 * const handleSignup = async () => {
 *   await signup();
 *   analytics.signup('email', userRole);
 * };
 * 
 * 3. For Segment integration, install their SDK and replace window.gtag with window.analytics
 */

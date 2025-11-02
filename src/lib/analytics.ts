/**
 * Analytics Integration for Hair A.I.
 * Supports Google Analytics 4, Mixpanel, and custom event tracking
 */

import { Platform } from '@/platform/index';
import { logger } from './logger';

// Analytics configuration - lazy loaded to prevent build-time issues
let GA4_MEASUREMENT_ID: string | null = null;
let MIXPANEL_TOKEN: string | null = null;

type GtagFunction = (...args: unknown[]) => unknown;

interface GtagWindow extends Window {
  gtag: GtagFunction;
}

const getGtag = (): GtagFunction | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const potentialWindow = window as Partial<GtagWindow>;
  return typeof potentialWindow.gtag === 'function'
    ? potentialWindow.gtag
    : null;
};

type AnalyticsPrimitive = string | number | boolean | null;

export type AnalyticsValue =
  | AnalyticsPrimitive
  | Date
  | AnalyticsValue[]
  | { [key: string]: AnalyticsValue }
  | undefined;

export type AnalyticsProperties = Record<string, AnalyticsValue>;

type SanitizedAnalyticsValue =
  | AnalyticsPrimitive
  | SanitizedAnalyticsValue[]
  | { [key: string]: SanitizedAnalyticsValue };

const sanitizeAnalyticsValue = (
  value: AnalyticsValue
): SanitizedAnalyticsValue | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    const sanitizedArray = value
      .map(item => sanitizeAnalyticsValue(item))
      .filter((item): item is SanitizedAnalyticsValue => item !== undefined);

    return sanitizedArray;
  }

  if (typeof value === 'object') {
    return Object.entries(value).reduce<
      Record<string, SanitizedAnalyticsValue>
    >((acc, [key, nestedValue]) => {
      const sanitized = sanitizeAnalyticsValue(nestedValue);

      if (sanitized !== undefined) {
        acc[key] = sanitized;
      }

      return acc;
    }, {});
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'string') {
    // Basic sanitization: remove dangerous SQL patterns
    // This does NOT replace parameterized queries for DB usage!
    const dangerousPatterns = [
      /(\bor\b|\band\b|\bunion\b|\bselect\b|\binsert\b|\bdelete\b|\bupdate\b|\bdrop\b|\bexec\b|\b--\b|;)/gi,
      /('|")\s*=\s*\1/,
      /(\bOR\b\s+['"]?\d+['"]?\s*=\s*['"]?\d+['"]?)/gi,
      /(\bUNION\b\s+\bSELECT\b)/gi,
    ];
    let sanitized = value;
    dangerousPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });
    return sanitized;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  return undefined;
};

const sanitizeAnalyticsProperties = (
  properties?: AnalyticsProperties
): Record<string, SanitizedAnalyticsValue> => {
  if (!properties) {
    return {};
  }

  return Object.entries(properties).reduce<
    Record<string, SanitizedAnalyticsValue>
  >((acc, [key, value]) => {
    const sanitized = sanitizeAnalyticsValue(value);

    if (sanitized !== undefined) {
      acc[key] = sanitized;
    }

    return acc;
  }, {});
};

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
  if (!analyticsInitialized) {
    logger.debug(
      'trackPageView called before analytics initialized',
      'analytics',
      { pagePath }
    );
    return;
  }

  const pageTitleValue =
    pageTitle ?? (typeof document !== 'undefined' ? document.title : undefined);

  trackEvent('page_view', {
    page_path: pagePath,
    page_title: pageTitleValue,
    platform: Platform.platform,
  });
};

/**
 * Track a custom event
 */
export const trackEvent = (
  eventName: string,
  properties?: AnalyticsProperties
) => {
  if (!analyticsInitialized) {
    logger.debug(
      'trackEvent called before analytics initialized',
      'analytics',
      { eventName }
    );
    return;
  }

  const sanitizedProperties = sanitizeAnalyticsProperties(properties);
  const eventData = {
    ...sanitizedProperties,
    platform:
      typeof sanitizedProperties.platform === 'string'
        ? sanitizedProperties.platform
        : Platform.platform,
    timestamp:
      typeof sanitizedProperties.timestamp === 'string'
        ? sanitizedProperties.timestamp
        : new Date().toISOString(),
  };

  const gtag = getGtag();
  if (gtag) {
    gtag('event', eventName, eventData);
  }

  logger.debug('Event tracked', 'analytics', { eventName, eventData });
};

/**
 * Set user properties
 */
export const setUserProperties = (
  userId: string,
  properties?: AnalyticsProperties
) => {
  if (!analyticsInitialized) {
    logger.debug(
      'setUserProperties called before analytics initialized',
      'analytics',
      { userId }
    );
    return;
  }

  const gtag = getGtag();
  if (!gtag) {
    return;
  }

  const sanitizedProperties = sanitizeAnalyticsProperties(properties);

  gtag('set', 'user_properties', {
    user_id: userId,
    ...sanitizedProperties,
  });

  logger.debug('User properties set', 'analytics', {
    userId,
    properties: sanitizedProperties,
  });
};

/**
 * Track user identification
 */
export const identifyUser = (userId: string, traits?: AnalyticsProperties) => {
  if (!analyticsInitialized) {
    logger.debug(
      'identifyUser called before analytics initialized',
      'analytics',
      { userId }
    );
    return;
  }

  const measurementId = getGA4Id();
  if (!measurementId) {
    logger.debug(
      'identifyUser skipped due to missing measurement id',
      'analytics',
      { userId }
    );
    return;
  }

  const gtag = getGtag();
  if (!gtag) {
    return;
  }

  const sanitizedTraits = sanitizeAnalyticsProperties(traits);

  gtag('config', measurementId, {
    user_id: userId,
    ...sanitizedTraits,
  });

  logger.debug('User identified', 'analytics', {
    userId,
    traits: sanitizedTraits,
  });
};

class Analytics {
  private enabled: boolean;

  constructor() {
    // Enable in both dev and prod for comprehensive tracking
    this.enabled = true;
  }

  /**
   * Track a custom event
   */
  track(eventName: string, eventData?: AnalyticsProperties): void {
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
  signup(
    method: string,
    role: string,
    campaignData?: AnalyticsProperties
  ): void {
    this.track('sign_up', { method, role, ...(campaignData ?? {}) });
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
      value: amount,
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
      currency: 'USD',
    });
  }

  /**
   * Track subscription success (with optional campaign data)
   */
  purchaseCompleted(
    plan: string,
    amount: number,
    campaignData?: AnalyticsProperties
  ): void {
    this.track('purchase_completed', {
      plan,
      value: amount,
      currency: 'USD',
      ...(campaignData ?? {}),
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
      error_context: errorContext,
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

  firstServiceCreated(serviceData: {
    name: string;
    price: number;
    duration: number;
  }): void {
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
      value: amount,
    });
  }

  subscriptionCancelled(reason?: string): void {
    this.track('subscription_cancelled', { reason });
  }

  appointmentBooked(
    serviceType: string,
    amount: number,
    isFirst: boolean = false
  ): void {
    this.track(isFirst ? 'first_appointment_booked' : 'appointment_booked', {
      serviceType,
      amount,
      currency: 'USD',
      value: amount,
    });
  }

  appointmentCancelled(
    reason?: string,
    cancelledBy?: 'client' | 'stylist'
  ): void {
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
      value: amount,
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

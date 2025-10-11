/**
 * Analytics Integration for Hair A.I.
 * Supports Google Analytics 4, Mixpanel, and custom event tracking
 */

import { Platform } from '@/platform';

// Analytics configuration
const GA4_MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID || '';
const MIXPANEL_TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN || '';

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

  // Google Analytics 4 - with security validation
  if (!GA4_MEASUREMENT_ID || !isValidGA4Id(GA4_MEASUREMENT_ID)) {
    console.info('[Analytics] GA4 not configured or invalid. Add VITE_GA4_MEASUREMENT_ID to enable tracking.');
    analyticsInitialized = true;
    isInitialized = true;
    return;
  }

  if (Platform.isWeb) {
    // GA4 script injection
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA4_MEASUREMENT_ID}', {
        send_page_view: false,
        debug_mode: ${import.meta.env.DEV}
      });
    `;
    document.head.appendChild(script2);
  }

  // Mixpanel (optional)
  if (MIXPANEL_TOKEN) {
    // Add Mixpanel initialization here if needed
  }

  isInitialized = true;
  analyticsInitialized = true;
  console.log('[Analytics] Initialized successfully');
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
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle || document.title,
      platform: Platform.platform,
    });
  }

  console.log('[Analytics] Page view:', pagePath);
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
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, eventData);
  }

  console.log('[Analytics] Event:', eventName, eventData);
};

/**
 * Set user properties
 */
export const setUserProperties = (userId: string, properties?: Record<string, any>) => {
  if (!analyticsInitialized) return;

  // Google Analytics 4
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('set', 'user_properties', {
      user_id: userId,
      ...properties,
    });
  }

  console.log('[Analytics] User properties set:', userId);
};

/**
 * Track user identification
 */
export const identifyUser = (userId: string, traits?: Record<string, any>) => {
  if (!analyticsInitialized) return;

  // Google Analytics 4
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', GA4_MEASUREMENT_ID, {
      user_id: userId,
      ...traits,
    });
  }

  console.log('[Analytics] User identified:', userId);
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
   * Track user signup
   */
  signup(method: string, role: string): void {
    this.track('sign_up', { method, role });
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
   * Track formula generation (legacy)
   */
  formulaGeneratedLegacy(colorLine?: string): void {
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
   * Track subscription success
   */
  purchaseCompleted(plan: string, amount: number): void {
    this.track('purchase_completed', { 
      plan,
      value: amount,
      currency: 'USD'
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

  // Legacy appointment tracking methods (use new versions above)
  appointmentBookedLegacy(stylistId: string, serviceId: string): void {
    this.track('appointment_booked', { stylist_id: stylistId, service_id: serviceId });
  }

  appointmentCanceledLegacy(appointmentId: string): void {
    this.track('appointment_canceled', { appointment_id: appointmentId });
  }

  appointmentRescheduledLegacy(appointmentId: string): void {
    this.track('appointment_rescheduled', { appointment_id: appointmentId });
  }

  // Subscriptions
  subscriptionStarted(tier: string): void {
    this.track('subscription_started', { tier });
  }

  subscriptionCanceled(tier: string): void {
    this.track('subscription_canceled', { tier });
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
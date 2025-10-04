/**
 * Basic Analytics Helper
 * Tracks key user events for product analytics
 * 
 * To integrate with Google Analytics 4 or other platforms,
 * add the tracking script to index.html and use this helper to fire events.
 */

interface AnalyticsEvent {
  event_name: string;
  event_data?: Record<string, any>;
}

class Analytics {
  private enabled: boolean;

  constructor() {
    // Only enable in production
    this.enabled = import.meta.env.PROD;
  }

  /**
   * Track a custom event
   */
  track(eventName: string, eventData?: Record<string, any>): void {
    if (!this.enabled) {
      console.log('[Analytics - Dev Only]', eventName, eventData);
      return;
    }

    // If GA4 is loaded
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, eventData);
    }

    // Add other analytics platforms here (Segment, Mixpanel, etc.)
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
   * Track formula generation
   */
  formulaGenerated(colorLine?: string): void {
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
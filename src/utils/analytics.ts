// Comprehensive analytics tracking

interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  userId?: string;
  timestamp?: number;
  metadata?: Record<string, any>;
}

class AnalyticsManager {
  private queue: AnalyticsEvent[] = [];
  private isInitialized = false;

  initialize() {
    if (typeof window === 'undefined') return;
    
    // Initialize GA4 if available
    if (window.gtag) {
      this.isInitialized = true;
      console.log('Analytics initialized');
    }

    // Flush queue
    this.flushQueue();
  }

  track(event: AnalyticsEvent) {
    const enrichedEvent = {
      ...event,
      timestamp: Date.now(),
      page: window.location.pathname,
      referrer: document.referrer
    };

    if (this.isInitialized && window.gtag) {
      window.gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event.metadata
      });
    } else {
      this.queue.push(enrichedEvent);
    }

    // Also log to console in development
    if (import.meta.env.DEV) {
      console.log('Analytics:', enrichedEvent);
    }
  }

  private flushQueue() {
    if (!this.isInitialized) return;
    
    while (this.queue.length > 0) {
      const event = this.queue.shift();
      if (event && window.gtag) {
        window.gtag('event', event.action, {
          event_category: event.category,
          event_label: event.label,
          value: event.value,
          ...event.metadata
        });
      }
    }
  }

  // Page view tracking
  pageView(path: string) {
    this.track({
      category: 'Navigation',
      action: 'page_view',
      label: path
    });
  }

  // Feature usage tracking
  featureUsed(featureName: string, metadata?: Record<string, any>) {
    this.track({
      category: 'Feature',
      action: 'used',
      label: featureName,
      metadata
    });
  }

  // Conversion tracking
  conversion(conversionType: string, value?: number) {
    this.track({
      category: 'Conversion',
      action: conversionType,
      value,
      metadata: { conversionType }
    });
  }

  // Error tracking
  error(errorMessage: string, errorContext?: string) {
    this.track({
      category: 'Error',
      action: 'occurred',
      label: errorMessage,
      metadata: { context: errorContext }
    });
  }

  // Performance tracking
  performance(metricName: string, value: number) {
    this.track({
      category: 'Performance',
      action: metricName,
      value,
      metadata: { metric: metricName }
    });
  }

  // User engagement
  engagement(action: string, metadata?: Record<string, any>) {
    this.track({
      category: 'Engagement',
      action,
      metadata
    });
  }
}

export const analytics = new AnalyticsManager();

// Auto-initialize
if (typeof window !== 'undefined') {
  analytics.initialize();
}

// Declare gtag types - compatible with existing declaration
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

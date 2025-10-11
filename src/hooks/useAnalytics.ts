import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { analytics } from "@/lib/analytics";

/**
 * Hook to automatically track page views on route changes
 */
export const useAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Ensure analytics is initialized before tracking
    if (typeof window !== 'undefined') {
      analytics.pageView(location.pathname);
    }
  }, [location.pathname]);

  return { analytics };
};

/**
 * Hook to track specific events with automatic context
 */
export const useEventTracking = () => {
  const trackWithContext = (eventName: string, properties?: Record<string, any>) => {
    analytics.track(eventName, {
      ...properties,
      page: window.location.pathname,
      referrer: document.referrer,
    });
  };

  return {
    track: trackWithContext,
    trackClick: (elementName: string, properties?: Record<string, any>) => {
      trackWithContext("element_clicked", {
        element: elementName,
        ...properties,
      });
    },
    trackFormSubmit: (formName: string, properties?: Record<string, any>) => {
      trackWithContext("form_submitted", {
        form: formName,
        ...properties,
      });
    },
    trackError: (errorMessage: string, errorContext?: string) => {
      analytics.error(errorMessage, errorContext);
    },
  };
};

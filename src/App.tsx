/**
 * hA.I.r - AI-Powered Hair Salon Management Platform
 * Copyright © 2025 hA.I.r. All Rights Reserved.
 */

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { BrowserRouter, Routes } from "react-router-dom";
import { useEffect, Suspense } from "react";
import { EnhancedAuthProvider } from "@/contexts/EnhancedAuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GlobalErrorBoundary } from "@/components/errors/GlobalErrorBoundary";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { DemoModeProvider } from "@/components/demo/DemoMode";
import { CookieConsent } from "@/components/CookieConsent";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ScrollToTopButton } from "@/components/ui/scroll-to-top";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useSentryUser } from "@/hooks/useSentryUser";
import { useSessionTracking } from "@/hooks/useSessionTracking";
import { initAnalytics } from "@/lib/analytics";
import { initSentry } from "@/lib/monitoring";
import { initUTMTracking } from "@/lib/utm";
import { AppRoutes } from "@/routes";
import { TourProvider } from "@/components/onboarding/TourProvider";
import { userJourney } from "@/lib/logging/userJourneyTracker";
import { useLocation } from "react-router-dom";

// Import advanced accessibility features
import { GlobalAnnouncer } from "@/components/AccessibilityAnnouncer";

// Simplified - no problematic lazy loading

// Enhanced QueryClient with improved caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes (increased from 60s)
      gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      // Enable automatic query deduplication
      refetchOnMount: false,
      refetchOnReconnect: true,
    },
  },
});

const AnalyticsInitializer = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Initialize analytics and monitoring
    initAnalytics();
    initSentry();
    initUTMTracking();
  }, []);
  
  // Track navigation changes
  useEffect(() => {
    userJourney.trackNavigation(location.pathname, { search: location.search });
  }, [location]);
  
  useAnalytics();
  useSentryUser(); // Sync user context with Sentry
  useSessionTracking(); // Track user sessions
  return null;
};


const App = () => {
  return (
    <GlobalErrorBoundary>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <SubscriptionProvider>
            <DemoModeProvider>
              <TooltipProvider>
                <OfflineIndicator />
                <Toaster />
                <Sonner />
                <CookieConsent />
                <GlobalAnnouncer />
                <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                  <ScrollToTopButton />
                  <EnhancedAuthProvider>
                    <AnalyticsInitializer />
                    <TourProvider>
                      <Suspense fallback={<LoadingSpinner message="Getting things ready..." />}>
                        <Routes>
                          {AppRoutes()}
                        </Routes>
                      </Suspense>
                    </TourProvider>
                  </EnhancedAuthProvider>
                </BrowserRouter>
              </TooltipProvider>
            </DemoModeProvider>
          </SubscriptionProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </GlobalErrorBoundary>
  );
};

export default App;

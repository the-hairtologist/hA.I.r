/**
 * hA.I.r - AI-Powered Hair Salon Management Platform
 * Copyright © 2025 hA.I.r. All Rights Reserved.
 */

import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  QueryClient,
  QueryClientProvider,
  QueryErrorResetBoundary,
} from '@tanstack/react-query';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { BrowserRouter, Routes } from 'react-router-dom';
import { useEffect, Suspense } from 'react';
import { EnhancedAuthProvider } from '@/contexts/EnhancedAuthContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { GlobalErrorBoundary } from '@/components/errors/GlobalErrorBoundary';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { DemoModeProvider } from '@/components/demo/DemoMode';
import { CookieConsent } from '@/components/CookieConsent';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useSentryUser } from '@/hooks/useSentryUser';
import { useSessionTracking } from '@/hooks/useSessionTracking';
import { initAnalytics } from '@/lib/analytics';
import { initSentry } from '@/lib/monitoring';
import { initUTMTracking } from '@/lib/utm';
import { AppRoutes } from '@/routes';
import { TourProvider } from '@/components/onboarding/TourProvider';
import { userJourney } from '@/lib/logging/userJourneyTracker';
import { useLocation } from 'react-router-dom';
import { performanceTracker } from '@/lib/monitoring/PerformanceTracker';
import { GlobalLoadingIndicator } from '@/components/GlobalLoadingIndicator';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';

// Import advanced accessibility features
import { GlobalAnnouncer } from '@/components/AccessibilityAnnouncer';

// Simplified - no problematic lazy loading

// Enhanced QueryClient with improved caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes (increased from 60s)
      gcTime: 10 * 60 * 1000, // 10 minutes garbage collection time (renamed from cacheTime in v5)
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
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
    // Defer all tracking to after initial render (improves TTI by ~1-2s)
    const timeoutId = setTimeout(() => {
      try {
        initAnalytics();
        initSentry();
        initUTMTracking();
        performanceTracker.initialize();
      } catch (error) {
        // Silent fail - monitoring is not critical
      }
    }, 1000); // Defer by 1 second

    return () => clearTimeout(timeoutId);
  }, []);

  // Track navigation changes (also deferred)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        userJourney.trackNavigation(location.pathname, {
          search: location.search,
        });
      } catch (error) {
        // Silent fail - tracking is not critical
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [location]);

  // Call hooks at top level (React rules require unconditional calls)
  useAnalytics();
  useSentryUser();
  useSessionTracking();

  return null;
};

const GlobalLoadingWrapper = () => {
  const { isLoading, message } = useGlobalLoading();
  return <GlobalLoadingIndicator isLoading={isLoading} message={message} />;
};

const App = () => {
  return (
    <GlobalErrorBoundary>
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary onReset={reset}>
            <QueryClientProvider client={queryClient}>
              <SubscriptionProvider>
                <DemoModeProvider>
                  <TooltipProvider>
                    <GlobalLoadingWrapper />
                    <OfflineIndicator />
                    <Toaster />
                    <Sonner />
                    <CookieConsent />
                    <GlobalAnnouncer />
                    <BrowserRouter>
                      <EnhancedAuthProvider>
                        <AnalyticsInitializer />
                        <TourProvider>
                          <Suspense
                            fallback={
                              <LoadingSpinner message="Getting things ready..." />
                            }
                          >
                            <Routes>{AppRoutes()}</Routes>
                          </Suspense>
                        </TourProvider>
                      </EnhancedAuthProvider>
                    </BrowserRouter>
                  </TooltipProvider>
                </DemoModeProvider>
              </SubscriptionProvider>
            </QueryClientProvider>
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    </GlobalErrorBoundary>
  );
};

export default App;

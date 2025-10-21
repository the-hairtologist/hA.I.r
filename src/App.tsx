/**
 * hA.I.r - AI-Powered Hair Salon Management Platform
 * Copyright © 2025 hA.I.r. All Rights Reserved.
 */

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { OfflineIndicator } from "@/components/shared";
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
import { performanceOptimizer } from "@/lib/performance/PerformanceOptimizer";
import { selfHealing } from "@/lib/selfHealing";
import { userJourney } from "@/lib/logging/userJourneyTracker";
import { useLocation } from "react-router-dom";

// Import advanced accessibility features
import { GlobalAnnouncer } from "@/components/AccessibilityAnnouncer";

// Safely import optional enhancement components
import { Suspense as ReactSuspense, lazy } from "react";

const PerformanceMonitor = lazy(() => 
  import("@/components/PerformanceMonitor")
    .then(m => ({ default: m.PerformanceMonitor }))
    .catch(() => ({ default: () => null }))
);

const PerformanceOverlay = lazy(() => 
  import("@/components/PerformanceOverlay")
    .then(m => ({ default: m.PerformanceOverlay }))
    .catch(() => ({ default: () => null }))
);

const MobileOptimizationsProvider = lazy(() => 
  import("@/components/MobileOptimizationsProvider")
    .then(m => ({ default: m.MobileOptimizationsProvider }))
    .catch(() => ({ default: () => null }))
);

const ServiceIntegrationTracker = lazy(() => 
  import("@/components/ServiceIntegrationTracker")
    .then(m => ({ default: m.ServiceIntegrationTracker }))
    .catch(() => ({ default: () => null }))
);

const RoleSwitchProtection = lazy(() => 
  import("@/components/RoleSwitchProtection")
    .then(m => ({ default: m.RoleSwitchProtection }))
    .catch(() => ({ default: () => null }))
);

// Defer non-critical monitoring components until after page load
let CoreWebVitals: any = null;
let NetworkStatusIndicator: any = null;
let ServiceWorkerUpdate: any = null;
let A11yTester: any = null;

// Load monitoring components after window load for better FCP/LCP
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    CoreWebVitals = lazy(() => 
      import("@/components/CoreWebVitals")
        .then(m => ({ default: m.CoreWebVitals }))
        .catch(() => ({ default: () => null }))
    );

    NetworkStatusIndicator = lazy(() => 
      import("@/components/NetworkStatusIndicator")
        .then(m => ({ default: m.NetworkStatusIndicator }))
        .catch(() => ({ default: () => null }))
    );

    ServiceWorkerUpdate = lazy(() => 
      import("@/components/ServiceWorkerUpdate")
        .then(m => ({ default: m.ServiceWorkerUpdate }))
        .catch(() => ({ default: () => null }))
    );

    A11yTester = lazy(() => 
      import("@/components/A11yTester")
        .then(m => ({ default: m.A11yTester }))
        .catch(() => ({ default: () => null }))
    );
  });
}

// Optimized QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
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
    
    // Initialize comprehensive performance optimizations
    performanceOptimizer.init().catch((error) => {
      import('@/lib/logging/productionLogger').then(({ logger }) => {
        logger.error('Failed to initialize performance optimizations', error);
      });
    });
    
    // Initialize self-healing system (error recovery, health monitoring, auto-maintenance)
    selfHealing.initialize().catch((error) => {
      import('@/lib/logging/productionLogger').then(({ logger }) => {
        logger.error('Failed to initialize self-healing system', error);
      });
    });
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
              <ReactSuspense fallback={null}>
                <MobileOptimizationsProvider>
                  <TooltipProvider>
                    <OfflineIndicator />
                    <Toaster />
                    <Sonner />
                    <CookieConsent />
                    {/* Advanced accessibility - GlobalAnnouncer for screen readers */}
                    <GlobalAnnouncer />
                    {/* Core Web Vitals monitoring - deferred after load */}
                    <ReactSuspense fallback={null}>
                      {CoreWebVitals && <CoreWebVitals />}
                    </ReactSuspense>
                    {/* Network status indicator - deferred after load */}
                    <ReactSuspense fallback={null}>
                      {NetworkStatusIndicator && <NetworkStatusIndicator />}
                    </ReactSuspense>
                    {/* Service worker update notifications - deferred after load */}
                    <ReactSuspense fallback={null}>
                      {ServiceWorkerUpdate && <ServiceWorkerUpdate />}
                    </ReactSuspense>
                    {/* Accessibility tester (dev only) - deferred after load */}
                    <ReactSuspense fallback={null}>
                      {A11yTester && <A11yTester />}
                    </ReactSuspense>
                    {/* Performance monitoring (dev only) */}
                    <ReactSuspense fallback={null}>
                      <PerformanceMonitor />
                    </ReactSuspense>
                    {/* Performance overlay (dev only) */}
                    <ReactSuspense fallback={null}>
                      <PerformanceOverlay />
                    </ReactSuspense>
                    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                      <ScrollToTopButton />
                      <EnhancedAuthProvider>
                        <AnalyticsInitializer />
                        {/* Service integration tracking - requires Router context */}
                        <ReactSuspense fallback={null}>
                          <ServiceIntegrationTracker />
                        </ReactSuspense>
                        <TourProvider>
                          {/* Role switch protection */}
                          <ReactSuspense fallback={null}>
                            <RoleSwitchProtection />
                          </ReactSuspense>
                          <Suspense fallback={<LoadingSpinner message="Getting things ready..." />}>
                            <Routes>
                              {AppRoutes()}
                            </Routes>
                          </Suspense>
                        </TourProvider>
                      </EnhancedAuthProvider>
                    </BrowserRouter>
                  </TooltipProvider>
                </MobileOptimizationsProvider>
              </ReactSuspense>
            </DemoModeProvider>
          </SubscriptionProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </GlobalErrorBoundary>
  );
};

export default App;

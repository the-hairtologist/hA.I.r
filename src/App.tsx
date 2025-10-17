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
import { HelmetProvider } from 'react-helmet-async';
import { EnhancedAuthProvider } from "@/contexts/EnhancedAuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GlobalErrorBoundary } from "@/components/errors/GlobalErrorBoundary";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { DemoModeProvider } from "@/components/demo/DemoMode";
import { CookieConsent } from "@/components/CookieConsent";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PerformanceReport } from "@/components/PerformanceReport";
import { AccessibilityShortcuts } from "@/components/AccessibilityShortcuts";
import { useAnalytics } from "@/hooks/useAnalytics";
import { initAnalytics } from "@/lib/analytics";
import { initSentry } from "@/lib/monitoring";
import { initUTMTracking } from "@/lib/utm";
import { AppRoutes } from "@/routes";
import { TourProvider } from "@/components/onboarding/TourProvider";
import { performanceOptimizer } from "@/lib/performance/PerformanceOptimizer";
import { selfHealing } from "@/lib/selfHealing";

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
  useEffect(() => {
    // Initialize analytics and monitoring
    initAnalytics();
    initSentry();
    initUTMTracking();
    
    // Initialize comprehensive performance optimizations
    performanceOptimizer.init().catch((error) => {
      console.error('Failed to initialize performance optimizations:', error);
    });
    
    // Initialize self-healing system (error recovery, health monitoring, auto-maintenance)
    selfHealing.initialize().catch((error) => {
      console.error('Failed to initialize self-healing system:', error);
    });
  }, []);
  
  useAnalytics();
  return null;
};


const App = () => {
  return (
    <HelmetProvider>
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
                      <PerformanceReport />
                      <AccessibilityShortcuts />
                      {/* Advanced accessibility - GlobalAnnouncer for screen readers */}
                      <GlobalAnnouncer />
                    {/* Performance monitoring (dev only) */}
                    <ReactSuspense fallback={null}>
                      <PerformanceMonitor />
                    </ReactSuspense>
                    {/* Performance overlay (dev only) */}
                    <ReactSuspense fallback={null}>
                      <PerformanceOverlay />
                    </ReactSuspense>
                    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
    </HelmetProvider>
  );
};

export default App;

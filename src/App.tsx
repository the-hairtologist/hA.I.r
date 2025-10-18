/**
 * hA.I.r - AI-Powered Hair Salon Management Platform
 * Copyright © 2025 hA.I.r. All Rights Reserved.
 */

import React, { useEffect, Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { BrowserRouter, Routes } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { EnhancedAuthProvider } from "@/contexts/EnhancedAuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GlobalErrorBoundary } from "@/components/errors/GlobalErrorBoundary";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { DemoModeProvider } from "@/components/demo/DemoMode";
import { CookieConsent } from "@/components/CookieConsent";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { NetworkAwareLoader } from "@/components/NetworkAwareLoader";
import { TimeoutGuard } from "@/components/TimeoutGuard";
import { PerformanceReport } from "@/components/PerformanceReport";
import { AccessibilityShortcuts } from "@/components/AccessibilityShortcuts";
import { CommandPalette } from "@/components/CommandPalette";
import { useAnalytics } from "@/hooks/useAnalytics";
import { initAnalytics } from "@/lib/analytics";
import { initSentry } from "@/lib/monitoring";
import { initUTMTracking } from "@/lib/utm";
import { AppRoutes } from "@/routes";
import { TourProvider } from "@/components/onboarding/TourProvider";
import { performanceOptimizer } from "@/lib/performance/PerformanceOptimizer";
import { selfHealing } from "@/lib/selfHealing";
import { GlobalAnnouncer } from "@/components/AccessibilityAnnouncer";
import { initPreloadStrategies } from "@/lib/performance/PreloadStrategy";

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

const AnalyticsInitializer = () => {
  useEffect(() => {
    // Defer non-critical initializations to idle time
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        // Initialize analytics and monitoring (non-critical)
        initAnalytics();
        initSentry();
        initUTMTracking();
        
        // Initialize resource preloading strategy (non-critical)
        initPreloadStrategies();
      });

      // Initialize self-healing after initial render
      requestIdleCallback(() => {
        selfHealing.initialize().catch((error) => {
          console.error('Failed to initialize self-healing system:', error);
        });
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        initAnalytics();
        initSentry();
        initUTMTracking();
        initPreloadStrategies();
        
        selfHealing.initialize().catch((error) => {
          console.error('Failed to initialize self-healing system:', error);
        });
      }, 1000);
    }
    
    // Initialize critical performance optimizations immediately
    performanceOptimizer.init().catch((error) => {
      console.error('Failed to initialize performance optimizations:', error);
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
          <NetworkAwareLoader>
            <QueryClientProvider client={queryClient}>
              <SubscriptionProvider>
                <DemoModeProvider>
                  <Suspense fallback={null}>
                    <MobileOptimizationsProvider>
                      <TooltipProvider>
                        <OfflineIndicator />
                        <Toaster />
                        <Sonner />
                        <CookieConsent />
                        <PerformanceReport />
                        {/* Advanced accessibility - GlobalAnnouncer for screen readers */}
                        <GlobalAnnouncer />
                      {/* Performance monitoring (dev only) */}
                      <Suspense fallback={null}>
                        <PerformanceMonitor />
                      </Suspense>
                      {/* Performance overlay (dev only) */}
                      <Suspense fallback={null}>
                        <PerformanceOverlay />
                      </Suspense>
                      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                        <EnhancedAuthProvider>
                          <AnalyticsInitializer />
                          {/* Components requiring Router context */}
                          <AccessibilityShortcuts />
                          <CommandPalette />
                          {/* Service integration tracking - requires Router context */}
                          <Suspense fallback={null}>
                            <ServiceIntegrationTracker />
                          </Suspense>
                          <TourProvider>
                            {/* Role switch protection */}
                            <Suspense fallback={null}>
                              <RoleSwitchProtection />
                            </Suspense>
                            <TimeoutGuard>
                              <Routes>
                                {AppRoutes()}
                              </Routes>
                            </TimeoutGuard>
                          </TourProvider>
                        </EnhancedAuthProvider>
                      </BrowserRouter>
                    </TooltipProvider>
                  </MobileOptimizationsProvider>
                </Suspense>
              </DemoModeProvider>
            </SubscriptionProvider>
          </QueryClientProvider>
        </NetworkAwareLoader>
        </ErrorBoundary>
      </GlobalErrorBoundary>
    </HelmetProvider>
  );
};

export default App;

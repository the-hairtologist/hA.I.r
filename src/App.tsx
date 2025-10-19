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
import { FirstTimeOnboarding } from "@/components/onboarding/FirstTimeOnboarding";
import { performanceOptimizer } from "@/lib/performance/PerformanceOptimizer";
import { selfHealing } from "@/lib/selfHealing";
import { GlobalAnnouncer } from "@/components/AccessibilityAnnouncer";
import { initPreloadStrategies } from "@/lib/performance/PreloadStrategy";
import { initPushNotifications } from "@/lib/engagement/pushNotifications";
import { initOriginVerification } from "@/lib/security/originVerification";
import { initABTesting } from "@/lib/engagement/abTesting";
import { initCacheReporting } from "@/lib/cache/cacheReport";
import { initRoutePrefetcher } from "@/lib/prefetch/routePrefetcher";
import { initContrastValidator } from "@/lib/accessibility/contrastValidator";
import { initFocusAudit } from "@/lib/accessibility/focusAudit";
import { initLighthouseMonitoring } from "@/lib/qa/lighthouseAudit";
import { PushOptInDialog } from "@/components/PushOptInDialog";
import { AppLayout } from "@/components/layout/AppLayout";
import "@/lib/mobileHealthCheck";

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

// Import MobileOptimizationsProvider directly (not lazy) for immediate mobile fixes
import { MobileOptimizationsProvider } from "@/components/MobileOptimizationsProvider";

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
        
        // Phase 2 - Intelligence Layer
        initCacheReporting();
        initRoutePrefetcher();
        
        // Phase 3 - Engagement Layer
        initPushNotifications();
        initABTesting();
        
        // Phase 4 - Security Layer
        initOriginVerification();
        
        // Phase 5 - QA Layer (dev only)
        if (import.meta.env.DEV) {
          initContrastValidator();
          initFocusAudit();
          initLighthouseMonitoring();
        }
      });

      // Defer self-healing initialization by 3 seconds
      requestIdleCallback(() => {
        setTimeout(() => {
          selfHealing.initialize().catch((error) => {
            console.error('Failed to initialize self-healing system:', error);
          });
        }, 3000);
      }, { timeout: 5000 });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        initAnalytics();
        initSentry();
        initUTMTracking();
        initPreloadStrategies();
        
        // Phase 2 - Intelligence Layer
        initCacheReporting();
        initRoutePrefetcher();
        
        // Phase 3 - Engagement Layer
        initPushNotifications();
        initABTesting();
        
        // Phase 4 - Security Layer
        initOriginVerification();
        
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
                  <MobileOptimizationsProvider>
                    <TooltipProvider>
                      <OfflineIndicator />
                      <Toaster />
                      <Sonner />
                      <CookieConsent />
                      <PushOptInDialog />
                      <PerformanceReport />
                      {/* Advanced accessibility - GlobalAnnouncer for screen readers */}
                      <GlobalAnnouncer />
                      {/* Performance monitoring (dev only) */}
                      {import.meta.env.DEV && (
                        <Suspense fallback={null}>
                          <PerformanceMonitor />
                        </Suspense>
                      )}
                      {/* Performance overlay (dev only) */}
                      {import.meta.env.DEV && (
                        <Suspense fallback={null}>
                          <PerformanceOverlay />
                        </Suspense>
                      )}
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
                            {/* First-time onboarding */}
                            <FirstTimeOnboarding />
                            {/* Role switch protection */}
                            <Suspense fallback={null}>
                              <RoleSwitchProtection />
                            </Suspense>
                            <TimeoutGuard timeout={15000}>
                              <AppLayout>
                                <Routes>
                                  {AppRoutes()}
                                </Routes>
                              </AppLayout>
                            </TimeoutGuard>
                          </TourProvider>
                        </EnhancedAuthProvider>
                      </BrowserRouter>
                    </TooltipProvider>
                  </MobileOptimizationsProvider>
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

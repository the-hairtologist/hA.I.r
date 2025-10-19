/**
 * hA.I.r - AI-Powered Hair Salon Management Platform
 * Copyright © 2025 hA.I.r. All Rights Reserved.
 */

import React, { useEffect, Suspense, lazy, useState } from "react";
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
import { useAuth } from "@/hooks/useAuth";
import { initAnalytics } from "@/lib/analytics";
import { initSentry, setUser, clearUser } from "@/lib/monitoring";
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
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
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

// Delayed service tracker to prevent blocking initial load
const DelayedServiceTracker = () => {
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    // Delay service tracker by 3 seconds to not block initial page load
    const timer = setTimeout(() => {
      setShouldMount(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!shouldMount) return null;

  return (
    <Suspense fallback={null}>
      <ServiceIntegrationTracker />
    </Suspense>
  );
};

const AnalyticsInitializer = () => {
  const { user } = useAuth();

  useEffect(() => {
    // ONLY initialize Sentry immediately for critical error tracking
    initSentry();
    
    // Defer EVERYTHING else until after first paint to prevent blocking
    requestAnimationFrame(() => {
      setTimeout(() => {
        // Initialize analytics (2s delay after first paint)
        initAnalytics();
        initUTMTracking();
        
        // Initialize resource preloading (2s delay)
        initPreloadStrategies();
        
        // Phase 2-5: All non-critical systems (3s delay)
        setTimeout(() => {
          initCacheReporting();
          initRoutePrefetcher();
          initPushNotifications();
          initABTesting();
          initOriginVerification();
          
          if (import.meta.env.DEV) {
            initContrastValidator();
            initFocusAudit();
            initLighthouseMonitoring();
          }
        }, 1000);
        
        // Self-healing system (5s delay total)
        setTimeout(() => {
          selfHealing.initialize().catch((error) => {
            console.error('Failed to initialize self-healing system:', error);
          });
        }, 3000);
      }, 2000);
    });
    
    // Performance optimizer (immediate but non-blocking)
    performanceOptimizer.init().catch((error) => {
      console.error('Failed to initialize performance optimizations:', error);
    });
  }, []);

  // Track user context in Sentry
  useEffect(() => {
    if (user) {
      setUser(user.id, user.email, user.user_metadata?.full_name);
    } else {
      clearUser();
    }
  }, [user]);
  
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
                          <DelayedServiceTracker />
                          {/* Components requiring Router context */}
                          <AccessibilityShortcuts />
                          <CommandPalette />
                          <TourProvider>
                            {/* First-time onboarding */}
                            <FirstTimeOnboarding />
                            {/* Role switch protection */}
                            <Suspense fallback={null}>
                              <RoleSwitchProtection />
                            </Suspense>
                            <AppLayout>
                              <Routes>
                                {AppRoutes()}
                              </Routes>
                            </AppLayout>
                            <PWAInstallPrompt />
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

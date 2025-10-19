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
import { ViewportChangeHandler } from "@/components/ViewportChangeHandler";
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
import { RoleSwitchProtection } from "@/components/RoleSwitchProtection";
import "@/lib/mobileHealthCheck";

// Removed problematic lazy-loaded components that were causing initialization conflicts

const AnalyticsInitializer = () => {
  const { user } = useAuth();

  useEffect(() => {
    try {
      // Initialize Sentry immediately for error tracking
      initSentry();
      
      // Defer non-critical initializations to idle time
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          try {
            // Initialize analytics and monitoring (non-critical)
            initAnalytics();
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
          } catch (error) {
            console.error('[Analytics] Non-critical init failed:', error);
          }
        });

        // Defer self-healing initialization by 5 seconds (reduced overhead)
        requestIdleCallback(() => {
          setTimeout(() => {
            selfHealing.initialize().catch((error) => {
              console.error('Failed to initialize self-healing system:', error);
            });
          }, 5000);
        }, { timeout: 10000 });
      } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        initAnalytics();
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
    } catch (error) {
      console.error('[Analytics] Critical init failed:', error);
    }
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
    <ErrorBoundary fallback={<div style={{padding: '20px'}}>Something went wrong</div>}>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <EnhancedAuthProvider>
              <SubscriptionProvider>
                <DemoModeProvider>
                  <TooltipProvider>
                    <AnalyticsInitializer />
                    <RoleSwitchProtection />
                    <OfflineIndicator />
                    <Toaster />
                    <Sonner />
                    <CookieConsent />
                    <PushOptInDialog />
                    <PWAInstallPrompt />
                    <PerformanceReport />
                    <GlobalAnnouncer />
                    <AccessibilityShortcuts />
                    <CommandPalette />
                    <ViewportChangeHandler />
                    <TourProvider>
                      <FirstTimeOnboarding />
                      <AppLayout>
                        <Routes>
                          {AppRoutes()}
                        </Routes>
                      </AppLayout>
                    </TourProvider>
                  </TooltipProvider>
                </DemoModeProvider>
              </SubscriptionProvider>
            </EnhancedAuthProvider>
          </BrowserRouter>
        </HelmetProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;

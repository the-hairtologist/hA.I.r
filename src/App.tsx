/**
 * hA.I.r - AI-Powered Hair Salon Management Platform
 * Copyright © 2025 hA.I.r. All Rights Reserved.
 * 
 * This software is proprietary and confidential.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 * See LICENSE.md for full terms.
 */

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { BrowserRouter, Routes } from "react-router-dom";
import { useEffect, lazy, Suspense, useState } from "react";
import { EnhancedAuthProvider, useEnhancedAuth } from "@/contexts/EnhancedAuthContext";
import { PerformanceOverlay } from "@/components/PerformanceOverlay";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GlobalErrorBoundary } from "@/components/errors/GlobalErrorBoundary";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { DemoModeProvider } from "@/components/demo/DemoMode";
import { GlobalAnnouncer } from "@/components/AccessibilityAnnouncer";
import { useGlobalKeyboardShortcuts } from "@/hooks/useGlobalKeyboardShortcuts";
import { RoleSwitchProtection } from "@/components/RoleSwitchProtection";
import { CookieConsent } from "@/components/CookieConsent";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAnalytics } from "@/hooks/useAnalytics";
import { initAnalytics } from "@/lib/analytics";
import { initSentry } from "@/lib/monitoring";
import { ServiceIntegrationTracker } from "@/components/ServiceIntegrationTracker";
import { AppRoutes } from "@/routes";
import { SubscriptionNudge } from "@/components/SubscriptionNudge";
import { useSubscriptionNudges } from "@/hooks/useSubscriptionNudges";
import { MobileOptimizationsProvider } from "@/components/MobileOptimizationsProvider";
import { initMobileOptimizations } from "@/lib/mobileOptimizations";
import { TourProvider } from "@/components/onboarding/TourProvider";

// Optimized QueryClient with caching and retry logic
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
      retry: 3, // Retry failed requests 3 times
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
      refetchOnWindowFocus: false,
    },
  },
});

const AnalyticsInitializer = () => {
  useEffect(() => {
    // Initialize analytics and crash logging
    initAnalytics();
    initSentry();
  }, []);
  
  useAnalytics();
  return null;
};

const KeyboardShortcutsInitializer = () => {
  useGlobalKeyboardShortcuts();
  return null;
};

const SubscriptionNudgeWrapper = () => {
  const { shouldShowNudge, dismissNudge, trialDaysRemaining, clientCount, appointmentCount } = useSubscriptionNudges();
  const { isAdmin } = useEnhancedAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Never show nudges to admins
    if (!isAdmin && shouldShowNudge) {
      setOpen(true);
    }
  }, [shouldShowNudge, isAdmin]);

  // Don't render anything for admins
  if (isAdmin) return null;

  const handleDismiss = () => {
    dismissNudge(shouldShowNudge);
    setOpen(false);
  };

  return (
    <SubscriptionNudge
      trigger={shouldShowNudge}
      open={open}
      onOpenChange={setOpen}
      onDismiss={handleDismiss}
      stats={{ trialDaysRemaining, clientCount, appointmentCount }}
    />
  );
};

const App = () => {
  useEffect(() => {
    const initializeSystems = async () => {
      try {
        // Initialize mobile optimizations first (critical for mobile UX)
        initMobileOptimizations();
        
        // Initialize cross-platform optimizer
        const { crossPlatformOptimizer } = await import('@/lib/platform/CrossPlatformOptimizer');
        await crossPlatformOptimizer.initialize();
        
        // Initialize self-healing system
        const { selfHealing } = await import('@/lib/selfHealing');
        await selfHealing.initialize();
        
        // Initialize performance monitoring (dev only)
        if (import.meta.env.DEV) {
          const { performanceMonitor } = await import('@/lib/performanceMonitor');
          performanceMonitor.init();
          setTimeout(() => performanceMonitor.report(), 10000);
        }
      } catch (error) {
        // Systems will retry on next load
      }
    };
    
    initializeSystems();
  }, []);

  return (
    <GlobalErrorBoundary>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <SubscriptionProvider>
            <DemoModeProvider>
              <MobileOptimizationsProvider>
                <TooltipProvider>
                  <TourProvider>
                    <GlobalAnnouncer />
                    <OfflineIndicator />
                    <Toaster />
                    <Sonner />
                    <CookieConsent />
                    <PerformanceOverlay />
                    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                      <EnhancedAuthProvider>
                        <AnalyticsInitializer />
                        <KeyboardShortcutsInitializer />
                        <ServiceIntegrationTracker />
                        <RoleSwitchProtection />
                        <SubscriptionNudgeWrapper />
                        <Suspense fallback={<LoadingSpinner message="Getting things ready..." />}>
                          <Routes>
                            {AppRoutes()}
                          </Routes>
                        </Suspense>
                      </EnhancedAuthProvider>
                    </BrowserRouter>
                  </TourProvider>
                </TooltipProvider>
              </MobileOptimizationsProvider>
            </DemoModeProvider>
          </SubscriptionProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </GlobalErrorBoundary>
  );
};

export default App;

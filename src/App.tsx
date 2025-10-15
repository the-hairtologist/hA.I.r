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
import { useEffect, lazy, Suspense } from "react";
import { EnhancedAuthProvider } from "@/contexts/EnhancedAuthContext";
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
import { ServiceIntegrationTracker } from "@/components/ServiceIntegrationTracker";
import { AppRoutes } from "@/routes";

// Optimized QueryClient with caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AnalyticsInitializer = () => {
  useEffect(() => {
    initAnalytics();
  }, []);
  
  useAnalytics();
  return null;
};

const KeyboardShortcutsInitializer = () => {
  useGlobalKeyboardShortcuts();
  return null;
};

const App = () => {
  useEffect(() => {
    const initializeSystems = async () => {
      try {
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
          <TooltipProvider>
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
            <Suspense fallback={<LoadingSpinner message="Getting things ready..." />}>
              <Routes>
                {AppRoutes()}
              </Routes>
            </Suspense>
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

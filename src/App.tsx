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
import { useAnalytics } from "@/hooks/useAnalytics";
import { initAnalytics } from "@/lib/analytics";
import { initSentry } from "@/lib/monitoring";
import { AppRoutes } from "@/routes";
import { TourProvider } from "@/components/onboarding/TourProvider";

// Import advanced accessibility features
import { GlobalAnnouncer } from "@/components/AccessibilityAnnouncer";

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
    initAnalytics();
    initSentry();
  }, []);
  
  useAnalytics();
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
                <TourProvider>
                  <OfflineIndicator />
                  <Toaster />
                  <Sonner />
                  <CookieConsent />
                  {/* Advanced accessibility - GlobalAnnouncer for screen readers */}
                  <GlobalAnnouncer />
                  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <EnhancedAuthProvider>
                      <AnalyticsInitializer />
                      <Suspense fallback={<LoadingSpinner message="Getting things ready..." />}>
                        <Routes>
                          {AppRoutes()}
                        </Routes>
                      </Suspense>
                    </EnhancedAuthProvider>
                  </BrowserRouter>
                </TourProvider>
              </TooltipProvider>
            </DemoModeProvider>
          </SubscriptionProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </GlobalErrorBoundary>
  );
};

export default App;

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
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
          
          {/* Shared Protected Routes - Limited access for clients */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardErrorBoundary>
                <Dashboard />
              </DashboardErrorBoundary>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          } />
          <Route path="/help" element={
            <ProtectedRoute>
              <Help />
            </ProtectedRoute>
          } />
          <Route path="/unsubscribe" element={<Unsubscribe />} />
          
          {/* Stylist-Only Routes - Most features */}
          <Route path="/messages" element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          } />
          <Route path="/resources" element={
            <ProtectedRoute allowedRoles={["stylist", "admin"]}>
              <Resources />
            </ProtectedRoute>
          } />
          <Route path="/knowledge" element={
            <ProtectedRoute allowedRoles={["stylist", "admin", "client"]}>
              <Knowledge />
            </ProtectedRoute>
          } />
          <Route path="/ai-assistant" element={
            <ProtectedRoute allowedRoles={["stylist", "admin"]}>
              <AIKnowledge />
            </ProtectedRoute>
          } />
          <Route path="/integrations" element={
            <ProtectedRoute allowedRoles={["stylist", "admin"]}>
              <Integrations />
            </ProtectedRoute>
          } />
          <Route path="/integrations/zapier" element={
            <ProtectedRoute allowedRoles={["stylist", "admin"]}>
              <ZapierIntegration />
            </ProtectedRoute>
          } />
          <Route path="/appointments" element={
            <ProtectedRoute>
              <Appointments />
            </ProtectedRoute>
          } />
          <Route path="/formulas" element={
            <ProtectedRoute allowedRoles={["stylist", "admin"]}>
              <Formulas />
            </ProtectedRoute>
          } />
          <Route path="/favorites" element={
            <ProtectedRoute allowedRoles={["client", "admin"]}>
              <FavoriteStylistsPage />
            </ProtectedRoute>
          } />
          <Route path="/booking-history" element={
            <ProtectedRoute allowedRoles={["client", "admin"]}>
              <BookingHistoryPage />
            </ProtectedRoute>
          } />
          <Route path="/client-reviews" element={
            <ProtectedRoute allowedRoles={["client", "admin"]}>
              <ClientReviewsPage />
            </ProtectedRoute>
          } />
          <Route path="/payment-methods" element={
            <ProtectedRoute allowedRoles={["client", "admin"]}>
              <PaymentMethodsPage />
            </ProtectedRoute>
          } />
          <Route path="/schedule" element={
            <ProtectedRoute allowedRoles={["stylist", "admin"]}>
              <SubscriptionGate feature="schedule">
                <ScheduleManagement />
              </SubscriptionGate>
            </ProtectedRoute>
          } />
          <Route path="/client-discovery" element={
            <ProtectedRoute allowedRoles={["stylist", "admin"]}>
              <ClientDiscovery />
            </ProtectedRoute>
          } />
          <Route path="/finance" element={
            <ProtectedRoute allowedRoles={["stylist", "admin"]}>
              <SubscriptionGate feature="payments">
                <Finance />
              </SubscriptionGate>
            </ProtectedRoute>
          } />
          <Route path="/products" element={
            <ProtectedRoute allowedRoles={["stylist", "admin"]}>
              <Products />
            </ProtectedRoute>
          } />
          <Route path="/portfolio" element={
            <ProtectedRoute allowedRoles={["stylist", "admin"]}>
              <SubscriptionGate feature="portfolio">
                <Portfolio />
              </SubscriptionGate>
            </ProtectedRoute>
          } />
          <Route path="/clients" element={
            <ProtectedRoute allowedRoles={["stylist", "admin"]}>
              <SubscriptionGate feature="clients">
                <Clients />
              </SubscriptionGate>
            </ProtectedRoute>
          } />
          <Route path="/services" element={
            <ProtectedRoute allowedRoles={["stylist", "admin"]}>
              <SubscriptionGate feature="services">
                <Services />
              </SubscriptionGate>
            </ProtectedRoute>
          } />
          <Route path="/referrals" element={
            <ProtectedRoute allowedRoles={["stylist", "admin"]}>
              <Referrals />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute allowedRoles={["stylist", "admin"]}>
              <GrowthAnalytics />
            </ProtectedRoute>
          } />
          <Route path="/feedback" element={
            <ProtectedRoute>
              <FeedbackBoard />
            </ProtectedRoute>
          } />
          <Route path="/showcase" element={
            <Suspense fallback={<LoadingSpinner />}>
              <ShowcaseDemo />
            </Suspense>
          } />
          <Route path="/ad-generator" element={
            <ProtectedRoute allowedRoles={["stylist", "admin"]}>
              <AdGenerator />
            </ProtectedRoute>
          } />
          <Route path="/stylist/reviews" element={
            <ProtectedRoute allowedRoles={["stylist", "admin"]}>
              <ClientReviews />
            </ProtectedRoute>
          } />
          <Route path="/booking-page" element={
            <ProtectedRoute allowedRoles={["stylist", "admin"]}>
              <BookingPage />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/access-codes" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AccessCodes />
            </ProtectedRoute>
          } />
          <Route path="/app-directory" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AppDirectory />
            </ProtectedRoute>
          } />
          <Route path="/admin/command" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminCommandCenter />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminUsers />
            </ProtectedRoute>
          } />
          <Route path="/admin/audit-logs" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AuditLogs />
            </ProtectedRoute>
          } />
          <Route path="/admin/activity" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ActivityLog />
            </ProtectedRoute>
          } />
          <Route path="/reviews" element={
            <ProtectedRoute allowedRoles={["client"]}>
              <Reviews />
            </ProtectedRoute>
          } />
          <Route path="/reviews/new" element={
            <ProtectedRoute allowedRoles={["client"]}>
              <Reviews />
            </ProtectedRoute>
          } />
          <Route path="/system-health" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <SystemHealth />
            </ProtectedRoute>
          } />
          <Route path="/email-campaigns" element={
            <ProtectedRoute allowedRoles={["admin", "stylist"]}>
              <EmailCampaigns />
            </ProtectedRoute>
          } />
          <Route path="/email-settings" element={
            <ProtectedRoute allowedRoles={["stylist", "admin"]}>
              <EmailSettings />
            </ProtectedRoute>
          } />
          <Route path="/email-sequences" element={
            <ProtectedRoute allowedRoles={["stylist", "admin"]}>
              <EmailSequences />
            </ProtectedRoute>
          } />
          
          {/* Client-Only Routes */}
          <Route path="/stylist-discovery" element={
            <ProtectedRoute>
              <StylistDiscovery />
            </ProtectedRoute>
          } />
          <Route path="/client-requests" element={
            <ProtectedRoute allowedRoles={["client"]}>
              <ClientRequests />
            </ProtectedRoute>
          } />
          <Route path="/book-appointment" element={
            <ProtectedRoute allowedRoles={["client"]}>
              <BookAppointment />
            </ProtectedRoute>
          } />
          <Route path="/stylist/:id" element={
            <ProtectedRoute>
              <StylistProfile />
            </ProtectedRoute>
          } />
          
          {/* Deep Link Routes - Public for sharing */}
          <Route path="/appointment/:id" element={<DeepLinkAppointment />} />
          <Route path="/transformation/:id" element={<DeepLinkTransformation />} />
          
          {/* Client Hair History - Client-optimized view */}
          <Route path="/client-formulas" element={
            <ProtectedRoute allowedRoles={["client", "admin"]}>
              <ClientFormulas />
            </ProtectedRoute>
          } />
          
          {/* PWA Installation Guide */}
          <Route path="/install" element={
            <ProtectedRoute>
              <InstallPWA />
            </ProtectedRoute>
          } />
          
          {/* Audit Report - Admin Only */}
          <Route path="/audit-report" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AuditReport />
            </ProtectedRoute>
          } />
          
          {/* Coming Soon Page */}
          <Route path="/coming-soon" element={
            <ProtectedRoute>
              <ComingSoon />
            </ProtectedRoute>
          } />
          
          {/* Legal Pages */}
          <Route path="/dmca" element={<DMCA />} />
          <Route path="/accessibility" element={<Accessibility />} />
          
          {/* Error Pages */}
          <Route path="/500" element={<ServerError />} />
          
          {/* 404 Catch-All */}
          <Route path="*" element={<NotFound />} />
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

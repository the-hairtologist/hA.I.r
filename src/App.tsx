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
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PerformanceOverlay } from "@/components/PerformanceOverlay";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { DashboardErrorBoundary } from "@/components/DashboardErrorBoundary";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { GlobalAnnouncer } from "@/components/AccessibilityAnnouncer";
import { useGlobalKeyboardShortcuts } from "@/hooks/useGlobalKeyboardShortcuts";
import { SubscriptionGate } from "@/components/SubscriptionGate";
import { RoleSwitchProtection } from "@/components/RoleSwitchProtection";
import { CookieConsent } from "@/components/CookieConsent";
import { lazy, Suspense } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAnalytics } from "@/hooks/useAnalytics";
import { initAnalytics } from "@/lib/analytics";
import { ServiceIntegrationTracker } from "@/components/ServiceIntegrationTracker";
// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const StylistDiscovery = lazy(() => import("./pages/StylistDiscovery"));
const Formulas = lazy(() => import("./pages/Formulas"));
const Appointments = lazy(() => import("./pages/Appointments"));
const BookAppointment = lazy(() => import("./pages/BookAppointment"));
const StylistProfile = lazy(() => import("./pages/StylistProfile"));
const ClientRequests = lazy(() => import("./pages/ClientRequests"));
const ClientDiscovery = lazy(() => import("./pages/ClientDiscovery"));

const Messages = lazy(() => import("./pages/Messages"));
const ScheduleManagement = lazy(() => import("./pages/ScheduleManagement"));
const Services = lazy(() => import("./pages/Services"));
const Settings = lazy(() => import("./pages/Settings"));
const Finance = lazy(() => import("./pages/Finance"));
const Products = lazy(() => import("./pages/Products"));
const Resources = lazy(() => import("./pages/Resources"));
const Knowledge = lazy(() => import("./pages/Knowledge"));
const AIKnowledge = lazy(() => import("./pages/AIAssistant"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const Clients = lazy(() => import("./pages/Clients"));
const AccessCodes = lazy(() => import("./pages/AccessCodes"));
const Integrations = lazy(() => import("./pages/Integrations"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ServerError = lazy(() => import("./pages/ServerError"));
const Referrals = lazy(() => import("./pages/Referrals"));
const SystemHealth = lazy(() => import("./pages/SystemHealth"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminCommandCenter = lazy(() => import("./pages/AdminCommandCenter"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AppDirectory = lazy(() => import("./pages/AppDirectory"));
const DMCA = lazy(() => import("./pages/DMCA"));
const Accessibility = lazy(() => import("./pages/Accessibility"));
const Notifications = lazy(() => import("./pages/Notifications"));
const ClientReviews = lazy(() => import("./pages/ClientReviews"));
const BookingPage = lazy(() => import("./pages/BookingPage"));
const Profile = lazy(() => import("./pages/Profile"));
const Help = lazy(() => import("./pages/Help"));
const ComingSoon = lazy(() => import("./pages/ComingSoon"));

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
        const { crossPlatformOptimizer } = await import('@/lib/platform/CrossPlatformOptimizer');
        await crossPlatformOptimizer.initialize();
      } catch (error) {
        // Optimizer will retry on next load
      }
    };
    
    initializeSystems();
  }, []);

  return (
    <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <SubscriptionProvider>
        <TooltipProvider>
          <GlobalAnnouncer />
          <OfflineIndicator />
          <Toaster />
          <Sonner />
          <CookieConsent />
          <PerformanceOverlay />
            <BrowserRouter>
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
            <ProtectedRoute>
              <Knowledge />
            </ProtectedRoute>
          } />
          <Route path="/ai-assistant" element={
            <ProtectedRoute>
              <AIKnowledge />
            </ProtectedRoute>
          } />
          <Route path="/integrations" element={
            <ProtectedRoute allowedRoles={["stylist", "admin"]}>
              <Integrations />
            </ProtectedRoute>
          } />
          <Route path="/appointments" element={
            <ProtectedRoute>
              <Appointments />
            </ProtectedRoute>
          } />
          <Route path="/formulas" element={
            <ProtectedRoute>
              <Formulas />
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
          <Route path="/reviews" element={
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
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
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
          <Route path="/system-health" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <SystemHealth />
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
          </BrowserRouter>
        </TooltipProvider>
      </SubscriptionProvider>
    </QueryClientProvider>
  </ErrorBoundary>
  );
};

export default App;

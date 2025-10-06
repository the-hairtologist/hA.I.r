import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { selfHealing } from "@/lib/selfHealing";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PerformanceOverlay } from "@/components/PerformanceOverlay";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { SubscriptionGate } from "@/components/SubscriptionGate";
import { RoleSwitchProtection } from "@/components/RoleSwitchProtection";
import { CookieConsent } from "@/components/CookieConsent";
import { lazy, Suspense } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Formulas = lazy(() => import("./pages/Formulas"));
const Appointments = lazy(() => import("./pages/Appointments"));
const BookAppointment = lazy(() => import("./pages/BookAppointment"));
const StylistDiscovery = lazy(() => import("./pages/StylistDiscovery"));
const StylistProfile = lazy(() => import("./pages/StylistProfile"));
const ClientRequests = lazy(() => import("./pages/ClientRequests"));
const ClientDiscovery = lazy(() => import("./pages/ClientDiscovery"));
const Messages = lazy(() => import("./pages/Messages"));
const ScheduleManagement = lazy(() => import("./pages/ScheduleManagement"));
const Services = lazy(() => import("./pages/Services"));
const Settings = lazy(() => import("./pages/Settings"));
const Finance = lazy(() => import("./pages/Finance"));
const Resources = lazy(() => import("./pages/Resources"));
const Knowledge = lazy(() => import("./pages/Knowledge"));
const AIAssistant = lazy(() => import("./pages/AIAssistant"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const Clients = lazy(() => import("./pages/Clients"));
const AccessCodes = lazy(() => import("./pages/AccessCodes"));
const Integrations = lazy(() => import("./pages/Integrations"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Referrals = lazy(() => import("./pages/Referrals"));

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

const App = () => {
  useEffect(() => {
    selfHealing.initialize();
    return () => selfHealing.shutdown();
  }, []);

  return (
    <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <SubscriptionProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <CookieConsent />
          <PerformanceOverlay />
          <BrowserRouter>
            <RoleSwitchProtection />
            <Suspense fallback={<LoadingSpinner message="Getting things ready..." />}>
              <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
          
          {/* Shared Protected Routes (Both Roles) */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/messages" element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/resources" element={
            <ProtectedRoute>
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
              <AIAssistant />
            </ProtectedRoute>
          } />
          <Route path="/integrations" element={
            <ProtectedRoute>
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
          
          {/* Stylist-Only Routes */}
          <Route path="/client-discovery" element={
            <ProtectedRoute allowedRoles={["stylist"]}>
              <ClientDiscovery />
            </ProtectedRoute>
          } />
          <Route path="/finance" element={
            <ProtectedRoute allowedRoles={["stylist"]}>
              <SubscriptionGate feature="payments">
                <Finance />
              </SubscriptionGate>
            </ProtectedRoute>
          } />
          <Route path="/schedule" element={
            <ProtectedRoute allowedRoles={["stylist"]}>
              <SubscriptionGate feature="schedule">
                <ScheduleManagement />
              </SubscriptionGate>
            </ProtectedRoute>
          } />
          <Route path="/portfolio" element={
            <ProtectedRoute allowedRoles={["stylist"]}>
              <SubscriptionGate feature="portfolio">
                <Portfolio />
              </SubscriptionGate>
            </ProtectedRoute>
          } />
          <Route path="/clients" element={
            <ProtectedRoute allowedRoles={["stylist"]}>
              <SubscriptionGate feature="clients">
                <Clients />
              </SubscriptionGate>
            </ProtectedRoute>
          } />
          <Route path="/services" element={
            <ProtectedRoute allowedRoles={["stylist"]}>
              <SubscriptionGate feature="services">
                <Services />
              </SubscriptionGate>
            </ProtectedRoute>
          } />
          <Route path="/referrals" element={
            <ProtectedRoute allowedRoles={["stylist"]}>
              <Referrals />
            </ProtectedRoute>
          } />
          <Route path="/access-codes" element={
            <ProtectedRoute>
              <AccessCodes />
            </ProtectedRoute>
          } />
          
          {/* Client-Only Routes */}
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
          {/* Public Stylist Routes - No auth required for discovery */}
          <Route path="/stylists" element={<StylistDiscovery />} />
          <Route path="/stylist/:id" element={<StylistProfile />} />
          <Route path="/s/:username" element={<StylistProfile />} />
          
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

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { SubscriptionGate } from "@/components/SubscriptionGate";
import { RoleSwitchProtection } from "@/components/RoleSwitchProtection";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Formulas from "./pages/Formulas";
import Appointments from "./pages/Appointments";
import BookAppointment from "./pages/BookAppointment";
import StylistDiscovery from "./pages/StylistDiscovery";
import StylistProfile from "./pages/StylistProfile";
import ClientRequests from "./pages/ClientRequests";
import ClientDiscovery from "./pages/ClientDiscovery";
import Messages from "./pages/Messages";
import ScheduleManagement from "./pages/ScheduleManagement";
import Services from "./pages/Services";
import Settings from "./pages/Settings";
import Finance from "./pages/Finance";
import Resources from "./pages/Resources";
import Knowledge from "./pages/Knowledge";
import Portfolio from "./pages/Portfolio";
import Clients from "./pages/Clients";
import AccessCodes from "./pages/AccessCodes";
import Integrations from "./pages/Integrations";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <SubscriptionProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <RoleSwitchProtection />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          
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
          <Route path="/stylists" element={
            <ProtectedRoute allowedRoles={["client"]}>
              <StylistDiscovery />
            </ProtectedRoute>
          } />
          <Route path="/stylist" element={
            <ProtectedRoute allowedRoles={["client"]}>
              <StylistProfile />
            </ProtectedRoute>
          } />
          
          {/* 404 Catch-All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
        </TooltipProvider>
      </SubscriptionProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

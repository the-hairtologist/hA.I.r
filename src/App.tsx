import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { SubscriptionGate } from "@/components/SubscriptionGate";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Formulas from "./pages/Formulas";
import Appointments from "./pages/Appointments";
import BookAppointment from "./pages/BookAppointment";
import StylistDiscovery from "./pages/StylistDiscovery";
import StylistProfile from "./pages/StylistProfile";
import MyAppointments from "./pages/MyAppointments";
import MyFormulas from "./pages/MyFormulas";
import Commissions from "./pages/Commissions";
import Payments from "./pages/Payments";
import Messages from "./pages/Messages";
import Knowledge from "./pages/Knowledge";
import Profile from "./pages/Profile";
import ScheduleManagement from "./pages/ScheduleManagement";
import Services from "./pages/Services";
import AccountSettings from "./pages/AccountSettings";
import AIAssistant from "./pages/AIAssistant";
import Portfolio from "./pages/Portfolio";
import Clients from "./pages/Clients";
import BookForClient from "./pages/BookForClient";
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
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* Shared Protected Routes (Both Roles) */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/messages" element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          } />
          <Route path="/knowledge" element={
            <ProtectedRoute>
              <Knowledge />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <AccountSettings />
            </ProtectedRoute>
          } />
          
          {/* Stylist-Only Routes */}
          <Route path="/formulas" element={
            <ProtectedRoute allowedRoles={["stylist"]}>
              <SubscriptionGate feature="formulas">
                <Formulas />
              </SubscriptionGate>
            </ProtectedRoute>
          } />
          <Route path="/appointments" element={
            <ProtectedRoute allowedRoles={["stylist"]}>
              <SubscriptionGate feature="appointments">
                <Appointments />
              </SubscriptionGate>
            </ProtectedRoute>
          } />
          <Route path="/commissions" element={
            <ProtectedRoute allowedRoles={["stylist"]}>
              <SubscriptionGate feature="commissions">
                <Commissions />
              </SubscriptionGate>
            </ProtectedRoute>
          } />
          <Route path="/payments" element={
            <ProtectedRoute allowedRoles={["stylist"]}>
              <SubscriptionGate feature="payments">
                <Payments />
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
          <Route path="/book-for-client" element={
            <ProtectedRoute allowedRoles={["stylist"]}>
              <SubscriptionGate feature="appointments">
                <BookForClient />
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
          <Route path="/ai-assistant" element={
            <ProtectedRoute allowedRoles={["stylist"]}>
              <SubscriptionGate feature="ai-assistant">
                <AIAssistant />
              </SubscriptionGate>
            </ProtectedRoute>
          } />
          
          {/* Client-Only Routes */}
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
          <Route path="/my-appointments" element={
            <ProtectedRoute allowedRoles={["client"]}>
              <MyAppointments />
            </ProtectedRoute>
          } />
          <Route path="/my-formulas" element={
            <ProtectedRoute allowedRoles={["client"]}>
              <MyFormulas />
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

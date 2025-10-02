import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Formulas from "./pages/Formulas";
import Appointments from "./pages/Appointments";
import BookAppointment from "./pages/BookAppointment";
import StylistDiscovery from "./pages/StylistDiscovery";
import MyAppointments from "./pages/MyAppointments";
import MyFormulas from "./pages/MyFormulas";
import Commissions from "./pages/Commissions";
import Payments from "./pages/Payments";
import Messages from "./pages/Messages";
import Knowledge from "./pages/Knowledge";
import Profile from "./pages/Profile";
import Availability from "./pages/Availability";
import Services from "./pages/Services";
import AccountSettings from "./pages/AccountSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/formulas" element={<Formulas />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/book" element={<BookAppointment />} />
          <Route path="/book-appointment" element={<BookAppointment />} />
          <Route path="/stylists" element={<StylistDiscovery />} />
          <Route path="/my-appointments" element={<MyAppointments />} />
          <Route path="/my-formulas" element={<MyFormulas />} />
          <Route path="/commissions" element={<Commissions />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/knowledge" element={<Knowledge />} />
          <Route path="/availability" element={<Availability />} />
          <Route path="/services" element={<Services />} />
          <Route path="/settings" element={<AccountSettings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

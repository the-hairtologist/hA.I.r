/**
 * hA.I.r - AI-Powered Hair Salon Management Platform
 * REBUILT FROM DOCUMENTATION - Clean Foundation
 * Copyright © 2025 hA.I.r. All Rights Reserved.
 */

import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { EnhancedAuthProvider } from "@/contexts/EnhancedAuthContext";

// Lazy load pages
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <EnhancedAuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
              </Routes>
            </TooltipProvider>
          </EnhancedAuthProvider>
        </BrowserRouter>
      </HelmetProvider>
    </QueryClientProvider>
  );
};

export default App;

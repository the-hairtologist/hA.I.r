/**
 * hA.I.r - AI-Powered Salon Assistant
 * Copyright © 2025 hA.I.r. All Rights Reserved.
 * 
 * This software is proprietary and confidential.
 * Unauthorized copying, distribution, or use is strictly prohibited.
 * 
 * Protected by intellectual property laws.
 * Patent pending. Trade secrets included.
 */

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initAnalytics } from "./lib/analytics";
import { addCopyrightNotice, detectSuspiciousActivity, logSuspiciousActivity } from "./lib/ipProtection";
import { PerformanceMonitor } from "./components/PerformanceMonitor";

// Initialize analytics on app load
initAnalytics();

// Add copyright notice to console
addCopyrightNotice();

// Detect and log suspicious activity
if (detectSuspiciousActivity()) {
  logSuspiciousActivity('Automated tool detected');
}

// Initialize performance monitoring in development
if (import.meta.env.DEV) {
  import('./lib/performanceOptimizer').then(({ observeImages }) => {
    observeImages();
  });
}

createRoot(document.getElementById("root")!).render(
  <>
    <PerformanceMonitor />
    <App />
  </>
);

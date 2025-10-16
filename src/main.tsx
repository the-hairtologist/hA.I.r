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
import { addCopyrightNotice, detectSuspiciousActivity, logSuspiciousActivity } from "./lib/ipProtection";
import { PerformanceMonitor } from "./components/PerformanceMonitor";
import { initMobileOptimizations, setupInputHandlers } from "./lib/mobileOptimizations";
import { initializeAdvancedPerformance } from "./lib/advancedPerformance";
import { initializeAdvancedSecurity } from "./lib/advancedSecurity";

// Analytics will be initialized AFTER user consents via CookieConsent component
// This ensures GDPR compliance (no tracking before explicit consent)

// 🚀 MAXIMUM PERFORMANCE MODE - Initialize all advanced systems
console.log('🚀 Initializing Maximum Performance Mode...');

// Initialize advanced performance optimizations
initializeAdvancedPerformance();

// Initialize advanced security features
initializeAdvancedSecurity();

// Initialize mobile optimizations for better performance
initMobileOptimizations();
setupInputHandlers();

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

console.log('✅ All systems initialized - Running at maximum capacity!');

createRoot(document.getElementById("root")!).render(
  <>
    <PerformanceMonitor />
    <App />
  </>
);

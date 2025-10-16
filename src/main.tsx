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

// CEO-Level: Initialize error detection FIRST
import { initializeErrorDetection } from "./lib/errorDetection";
import { initializePreventiveMaintenance } from "./lib/preventiveMaintenance";
import { registerCoreModules } from "./lib/dependencyValidator";

// Initialize all safety systems FIRST
initializeErrorDetection();
registerCoreModules();
initializePreventiveMaintenance();

// NOW initialize advanced features with error protection
try {
  const { injectCriticalCSS } = require("./lib/advancedPerformance");
  injectCriticalCSS();
  console.log('✅ Critical CSS injected');
} catch (error) {
  console.warn('⚠️ Critical CSS injection failed:', error);
}

try {
  const { CSPManager } = require("./lib/advancedSecurity");
  CSPManager.inject();
  console.log('✅ Content Security Policy active');
} catch (error) {
  console.warn('⚠️ CSP injection failed:', error);
}

// Safe imports with fallbacks
import { addCopyrightNotice, detectSuspiciousActivity, logSuspiciousActivity } from "./lib/ipProtection";

// Initialize mobile optimizations safely
try {
  const { initMobileOptimizations, setupInputHandlers } = require("./lib/mobileOptimizations");
  initMobileOptimizations();
  setupInputHandlers();
} catch (error) {
  console.warn('Mobile optimizations failed to load:', error);
}

// Add copyright notice
try {
  addCopyrightNotice();
} catch (error) {
  console.warn('Copyright notice failed:', error);
}

// Detect suspicious activity
try {
  if (detectSuspiciousActivity()) {
    logSuspiciousActivity('Automated tool detected');
  }
} catch (error) {
  console.warn('Suspicious activity detection failed:', error);
}

// Render app with error boundary
createRoot(document.getElementById("root")!).render(<App />);

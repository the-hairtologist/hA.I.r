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
import { initMobileOptimizations, setupInputHandlers } from "./lib/mobileOptimizations";

// Analytics will be initialized AFTER user consents via CookieConsent component
// This ensures GDPR compliance (no tracking before explicit consent)

// Initialize mobile optimizations
initMobileOptimizations();
setupInputHandlers();

// Add copyright notice
addCopyrightNotice();

// Detect suspicious activity
if (detectSuspiciousActivity()) {
  logSuspiciousActivity('Automated tool detected');
}

createRoot(document.getElementById("root")!).render(<App />);

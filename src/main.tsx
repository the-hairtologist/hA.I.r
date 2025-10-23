/**
 * hA.I.r - AI-Powered Hair Salon Management Platform
 * Copyright © 2025 hA.I.r. All Rights Reserved.
 */

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Safe initialization wrapper
const initializeApp = () => {
  try {
    console.log('[Main] Starting app initialization...');
    
    // Initialize Sentry with error handling
    import("@/lib/monitoring").then(({ initSentry }) => {
      try {
        initSentry();
        console.log('[Main] Sentry initialized');
      } catch (error) {
        console.warn('[Main] Sentry initialization failed (non-critical):', error);
      }
    }).catch((error) => {
      console.warn('[Main] Failed to load monitoring module:', error);
    });

    // Initialize self-healing system
    import("@/lib/selfHealing").then(({ selfHealing }) => {
      try {
        selfHealing.initialize();
        console.log('[Main] Self-healing system initialized');
      } catch (error) {
        console.warn('[Main] Self-healing init failed (non-critical):', error);
      }
    }).catch((error) => {
      console.warn('[Main] Failed to load self-healing module:', error);
    });

    // Render app immediately - don't wait for monitoring
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      throw new Error("Root element not found");
    }
    
    console.log('[Main] Rendering app...');
    createRoot(rootElement).render(<App />);
    console.log('[Main] App rendered successfully');
    
  } catch (error) {
    console.error('[Main] Critical initialization error:', error);
    // Show error to user
    document.body.innerHTML = `
      <div style="display: flex; align-items: center; justify-center: min-height: 100vh; padding: 20px; background: #fff;">
        <div style="max-width: 600px; text-align: center;">
          <h1 style="color: #ef4444; margin-bottom: 16px;">Application Error</h1>
          <p style="color: #374151; margin-bottom: 24px;">Failed to initialize application. Please refresh the page.</p>
          <button onclick="window.location.reload()" style="background: #3b82f6; color: #fff; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer;">
            Refresh Page
          </button>
          <details style="margin-top: 24px; text-align: left;">
            <summary style="cursor: pointer; color: #6b7280;">Technical Details</summary>
            <pre style="margin-top: 12px; padding: 12px; background: #f3f4f6; border-radius: 6px; overflow: auto; font-size: 12px;">${error}</pre>
          </details>
        </div>
      </div>
    `;
  }
};

// Start app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // DOM already loaded
  initializeApp();
}

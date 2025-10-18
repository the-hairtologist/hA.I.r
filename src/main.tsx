/**
 * hA.I.r - AI-Powered Hair Salon Management Platform
 * Copyright © 2025 hA.I.r. All Rights Reserved.
 */

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Service Worker cleanup for mobile issues
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    // Don't unregister, just ensure they're active
    registrations.forEach(registration => {
      registration.update().catch(() => {
        // If update fails, unregister and reload
        registration.unregister().then(() => {
          if (window.location.pathname === '/') {
            window.location.reload();
          }
        });
      });
    });
  }).catch((error) => {
    console.error('SW check failed:', error);
  });
}

// Cache clearing utility
const clearCacheAndReload = async () => {
  try {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
    localStorage.clear();
    sessionStorage.clear();
  } catch (e) {
    console.error('Cache clear failed:', e);
  } finally {
    window.location.reload();
  }
};

// Enhanced error handling wrapper with recovery UI
const initApp = () => {
  try {
    const rootElement = document.getElementById("root");
    
    if (!rootElement) {
      showErrorUI('Root element not found');
      return;
    }

    // Set timeout for app initialization
    const initTimeout = setTimeout(() => {
      console.warn('App taking too long to initialize');
      showTimeoutWarning();
    }, 10000);

    const root = createRoot(rootElement);
    root.render(<App />);
    
    // Clear timeout once rendered
    clearTimeout(initTimeout);
  } catch (error) {
    console.error('App initialization failed:', error);
    showErrorUI('Initialization failed');
  }
};

// Show error UI with recovery options
const showErrorUI = (message: string) => {
  document.body.innerHTML = `
    <div style="display: flex; align-items: center; justify-center: min-height: 100vh; background: linear-gradient(to bottom right, #f3f4f6, #e5e7eb); font-family: system-ui, -apple-system, sans-serif;">
      <div style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); max-width: 400px; text-align: center;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">✂️</div>
        <h1 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5rem; color: #111827;">Loading Error</h1>
        <p style="color: #6b7280; margin-bottom: 1.5rem;">${message}. Please try again.</p>
        <button onclick="location.reload()" style="background: #3b82f6; color: white; padding: 0.75rem 1.5rem; border-radius: 8px; border: none; cursor: pointer; font-weight: 500; margin-right: 0.5rem;">Refresh</button>
        <button onclick="(${clearCacheAndReload.toString()})()" style="background: #6b7280; color: white; padding: 0.75rem 1.5rem; border-radius: 8px; border: none; cursor: pointer; font-weight: 500;">Clear Cache</button>
      </div>
    </div>
  `;
};

// Show timeout warning (non-blocking)
const showTimeoutWarning = () => {
  const warning = document.createElement('div');
  warning.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #fbbf24; color: #78350f; padding: 1rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 9999; max-width: 300px;';
  warning.innerHTML = `
    <strong>Loading slowly...</strong><br>
    <small>The app is taking longer than expected. Please wait or refresh.</small>
  `;
  document.body.appendChild(warning);
  setTimeout(() => warning.remove(), 5000);
};

// Initialize app
initApp();

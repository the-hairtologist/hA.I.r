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

// Error handling wrapper
const initApp = () => {
  try {
    const rootElement = document.getElementById("root");
    
    if (!rootElement) {
      document.body.innerHTML = '<div style="padding: 20px; text-align: center;"><h1>Loading Error</h1><p>Please refresh the page</p><button onclick="location.reload()">Refresh</button></div>';
      return;
    }

    const root = createRoot(rootElement);
    root.render(<App />);
  } catch (error) {
    console.error('App initialization failed:', error);
    document.body.innerHTML = '<div style="padding: 20px; text-align: center;"><h1>Loading Error</h1><p>Please clear your cache and refresh</p><button onclick="location.reload()">Refresh</button></div>';
  }
};

// Initialize app
initApp();

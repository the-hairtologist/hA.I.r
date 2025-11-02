/**
 * hA.I.r - AI-Powered Hair Salon Management Platform
 * Copyright © 2025 hA.I.r. All Rights Reserved.
 */

import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safe initialization wrapper
const initializeApp = () => {
  try {
    // Initialize Sentry with error handling
    import('@/lib/monitoring')
      .then(({ initSentry }) => {
        try {
          initSentry();
        } catch (error) {
          // Sentry init failure is non-critical
        }
      })
      .catch(() => {
        // Monitoring module load failure is non-critical
      });

    // Render app immediately - don't wait for monitoring
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error('Root element not found');
    }

    createRoot(rootElement).render(<App />);
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

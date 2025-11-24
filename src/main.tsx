/**
 * hA.I.r - AI-Powered Hair Salon Management Platform
 * Copyright © 2025 hA.I.r. All Rights Reserved.
 */

import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { StrictMode } from 'react';

// Error screen component for initialization failures
const ErrorScreen = ({ error }: { error: unknown }) => {
  const errorMessage = String(error);
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      background: '#fff'
    }}>
      <div style={{
        maxWidth: '600px',
        textAlign: 'center'
      }}>
        <h1 style={{
          color: '#ef4444',
          marginBottom: '16px',
          fontSize: '24px',
          fontWeight: 'bold'
        }}>
          Application Error
        </h1>
        <p style={{
          color: '#374151',
          marginBottom: '24px',
          fontSize: '16px'
        }}>
          Failed to initialize application. Please refresh the page.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            background: '#3b82f6',
            color: '#fff',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500'
          }}
        >
          Refresh Page
        </button>
        <details style={{
          marginTop: '24px',
          textAlign: 'left'
        }}>
          <summary style={{
            cursor: 'pointer',
            color: '#6b7280',
            fontSize: '14px'
          }}>
            Technical Details
          </summary>
          <pre style={{
            marginTop: '12px',
            padding: '12px',
            background: '#f3f4f6',
            borderRadius: '6px',
            overflow: 'auto',
            fontSize: '12px',
            color: '#1f2937',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            {errorMessage}
          </pre>
        </details>
      </div>
    </div>
  );
};

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
    // Show error to user using React component
    const rootElement = document.getElementById('root');
    if (rootElement) {
      createRoot(rootElement).render(<ErrorScreen error={error} />);
    } else {
      // Fallback if root element doesn't exist
      document.body.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px;">
          <div style="text-align: center;">
            <h1 style="color: #ef4444;">Critical Error</h1>
            <p>Unable to initialize application.</p>
            <button onclick="window.location.reload()" style="margin-top: 16px; padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">Reload</button>
          </div>
        </div>
      `;
    }
  }
};

// Start app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // DOM already loaded
  initializeApp();
}

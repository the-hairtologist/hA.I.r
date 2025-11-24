/**
 * hA.I.r - AI-Powered Hair Salon Management Platform
 * Copyright © 2025 hA.I.r. All Rights Reserved.
 */

import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import React from 'react';

// Safe error display component - exported for fast refresh
export const ErrorScreen: React.FC<{ error: unknown }> = ({ error }) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : '';

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh', 
      padding: '20px', 
      background: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '600px', textAlign: 'center' }}>
        <h1 style={{ 
          color: '#ef4444', 
          marginBottom: '16px',
          fontSize: '24px'
        }}>
          Application Error
        </h1>
        <p style={{ color: '#374151', marginBottom: '24px' }}>
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
            fontSize: '14px'
          }}
        >
          Refresh Page
        </button>
        <details style={{ marginTop: '24px', textAlign: 'left' }}>
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
            {errorStack && `\n\nStack trace:\n${errorStack}`}
          </pre>
        </details>
      </div>
    </div>
  );
};

// Safe initialization wrapper
const initializeApp = () => {
  try {
    // Initialize Sentry with error handling (non-blocking)
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
    // Show error to user with React component
    const rootElement = document.getElementById('root');
    if (rootElement) {
      createRoot(rootElement).render(<ErrorScreen error={error} />);
    } else {
      // Fallback if root element is missing
      document.body.innerHTML = '<h1>Critical Error: Root element not found</h1>';
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

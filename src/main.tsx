/**
 * hA.I.r - AI-Powered Hair Salon Management Platform
 * Copyright © 2025 hA.I.r. All Rights Reserved.
 */

import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Error Screen Component - safe alternative to innerHTML
const ErrorScreen = ({ error }: { error: unknown }) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

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
        <h1 style={{ color: '#ef4444', marginBottom: '16px', fontSize: '24px' }}>
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
          <summary style={{ cursor: 'pointer', color: '#6b7280', fontSize: '14px' }}>
            Technical Details
          </summary>
          <pre style={{ 
            marginTop: '12px', 
            padding: '12px', 
            background: '#f3f4f6', 
            borderRadius: '6px', 
            overflow: 'auto', 
            fontSize: '12px',
            textAlign: 'left'
          }}>
            {errorMessage}
            {errorStack && `\n\n${errorStack}`}
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
    
    // Safely render error screen using React instead of innerHTML
    const rootElement = document.getElementById('root') || document.body;
    createRoot(rootElement).render(<ErrorScreen error={error} />);
  }
};

// Start app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // DOM already loaded
  initializeApp();
}

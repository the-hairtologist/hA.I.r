/**
 * Phase 2: Code Splitting Strategy
 * Aggressive lazy loading by role and feature
 */

import { lazy, ComponentType } from 'react';

// Retry logic for failed chunk loading
function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  retriesLeft = 3,
  interval = 1000
) {
  return lazy(() =>
    factory().catch((error) => {
      if (retriesLeft === 0) {
        // Fallback: reload page if chunk loading fails completely
        if (error.message.includes('Failed to fetch dynamically imported module')) {
          window.location.reload();
        }
        throw error;
      }

      return new Promise<{ default: T }>((resolve) => {
        setTimeout(() => {
          factory().then(resolve).catch(() => {
            // Recursive retry with exponential backoff
            lazyWithRetry(factory, retriesLeft - 1, interval * 2);
          });
        }, interval);
      });
    })
  );
}

// Admin-only pages (lazy load)
export const AdminPages = {
  CommandCenter: lazyWithRetry(() => import('@/pages/AdminCommandCenter')),
  Revenue: lazyWithRetry(() => import('@/pages/AdminRevenue')),
  Users: lazyWithRetry(() => import('@/pages/AdminUsers')),
  AuditLogs: lazyWithRetry(() => import('@/pages/AuditLogs')),
};

// Stylist-only pages (lazy load)
export const StylistPages = {
  Formulas: lazyWithRetry(() => import('@/pages/Formulas')),
  QuickFormula: lazyWithRetry(() => import('@/pages/QuickFormula')),
  Clients: lazyWithRetry(() => import('@/pages/Clients')),
  Portfolio: lazyWithRetry(() => import('@/pages/Portfolio')),
  CommissionTracking: lazyWithRetry(() => import('@/pages/CommissionTracking')),
  Reviews: lazyWithRetry(() => import('@/pages/Reviews')),
  Finance: lazyWithRetry(() => import('@/pages/Finance')),
};

// Client-only pages (lazy load)
export const ClientPages = {
  BookAppointment: lazyWithRetry(() => import('@/pages/BookAppointment')),
  ClientReviews: lazyWithRetry(() => import('@/pages/ClientReviews')),
  ClientDiscovery: lazyWithRetry(() => import('@/pages/ClientDiscovery')),
};

// Shared pages (lazy load)
export const SharedPages = {
  Appointments: lazyWithRetry(() => import('@/pages/Appointments')),
  Messages: lazyWithRetry(() => import('@/pages/Messages')),
  Settings: lazyWithRetry(() => import('@/pages/Settings')),
  Profile: lazyWithRetry(() => import('@/pages/Profile')),
  AIAssistant: lazyWithRetry(() => import('@/pages/AIAssistant')),
  Notifications: lazyWithRetry(() => import('@/pages/Notifications')),
};

// Heavy components (lazy load) - Only those that exist
export const HeavyComponents = {
  Schedule: lazyWithRetry(() => import('@/pages/ScheduleManagement')),
  GrowthAnalytics: lazyWithRetry(() => import('@/pages/GrowthAnalytics')),
  EmailSequences: lazyWithRetry(() => import('@/pages/EmailSequences')),
};

// Analytics & reporting (lazy load - low priority)
export const AnalyticsComponents = {
  Finance: lazyWithRetry(() => import('@/pages/Finance')),
  GrowthAnalytics: lazyWithRetry(() => import('@/pages/GrowthAnalytics')),
  ClientRetention: lazyWithRetry(() => import('@/pages/ClientRetention')),
};

// Preload functions for immediate role detection
export const preloadByRole = {
  admin: () => {
    // Preload is not available on lazy components without custom implementation
    // Keep this for future enhancement
  },
  stylist: () => {
    // Preload is not available on lazy components without custom implementation
    // Keep this for future enhancement
  },
  client: () => {
    // Preload is not available on lazy components without custom implementation
    // Keep this for future enhancement
  },
};

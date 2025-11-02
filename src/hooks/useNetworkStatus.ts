/**
 * Network Status Hook
 * Real-time monitoring of network connectivity and quality
 */

import { useState, useEffect } from 'react';
import { log } from '@/lib/logger';

export type NetworkQuality = 'slow' | 'moderate' | 'good' | 'excellent';

export interface NetworkStatus {
  isOnline: boolean;
  quality: NetworkQuality;
  lastChecked: number;
  effectiveType?: string; // '4g', '3g', '2g', 'slow-2g'
  downlink?: number; // Mbps
  rtt?: number; // Round trip time in ms
}

/**
 * Hook to monitor network status and connection quality
 */
export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    quality: 'good',
    lastChecked: Date.now(),
  });

  useEffect(() => {
    const updateStatus = (isOnline: boolean) => {
      const quality = determineQuality();
      const connection = getConnectionInfo();

      setStatus({
        isOnline,
        quality,
        lastChecked: Date.now(),
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
      });

      log.info(
        `Network status changed: ${isOnline ? 'online' : 'offline'}, quality: ${quality}`,
        'useNetworkStatus',
        connection
      );
    };

    const handleOnline = () => updateStatus(true);
    const handleOffline = () => updateStatus(false);

    // Listen to online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check connection quality periodically
    const qualityCheckInterval = setInterval(() => {
      if (navigator.onLine) {
        const quality = determineQuality();
        const connection = getConnectionInfo();

        setStatus(prev => ({
          ...prev,
          quality,
          lastChecked: Date.now(),
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
        }));
      }
    }, 30000); // Check every 30 seconds

    // Initial quality check
    updateStatus(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(qualityCheckInterval);
    };
  }, []);

  return status;
}

/**
 * Get connection information from Network Information API
 */
function getConnectionInfo(): {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
} {
  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;

  if (!connection) return {};

  return {
    effectiveType: connection.effectiveType,
    downlink: connection.downlink,
    rtt: connection.rtt,
  };
}

/**
 * Determine connection quality based on available metrics
 */
function determineQuality(): NetworkQuality {
  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;

  if (!connection) {
    // Fallback: assume good if online
    return navigator.onLine ? 'good' : 'slow';
  }

  const { effectiveType, rtt, downlink } = connection;

  // Use effective type as primary indicator
  if (
    effectiveType === '4g' &&
    (!rtt || rtt < 100) &&
    (!downlink || downlink > 10)
  ) {
    return 'excellent';
  }

  if (
    effectiveType === '4g' ||
    (effectiveType === '3g' && (!rtt || rtt < 300))
  ) {
    return 'good';
  }

  if (effectiveType === '3g' || effectiveType === '2g') {
    return 'moderate';
  }

  if (effectiveType === 'slow-2g' || (rtt && rtt > 1000)) {
    return 'slow';
  }

  // Default
  return 'good';
}

/**
 * Check if network is fast enough for AI operations
 */
export function isNetworkSufficientForAI(status: NetworkStatus): boolean {
  if (!status.isOnline) return false;

  // Slow connections may struggle with AI requests
  return status.quality !== 'slow';
}

/**
 * Get user-friendly network status message
 */
export function getNetworkStatusMessage(status: NetworkStatus): string | null {
  if (!status.isOnline) {
    return 'You are offline. Actions will sync when back online.';
  }

  if (status.quality === 'slow') {
    return 'Slow connection detected. Some features may be slower.';
  }

  return null;
}

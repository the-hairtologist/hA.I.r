import { useState, useEffect } from 'react';
import { offlineQueue } from '@/lib/offlineQueue';
import { toast } from 'sonner';

export interface OfflineStatus {
  isOnline: boolean;
  pendingActions: number;
  failedActions: number;
  lastSyncTime: Date | null;
  effectiveConnection: string | null;
}

export const useOfflineStatus = () => {
  const [status, setStatus] = useState<OfflineStatus>({
    isOnline: navigator.onLine,
    pendingActions: 0,
    failedActions: 0,
    lastSyncTime: null,
    effectiveConnection: null
  });

  const updateStatus = () => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    setStatus({
      isOnline: navigator.onLine,
      pendingActions: offlineQueue.getPendingCount(),
      failedActions: offlineQueue.getFailedCount(),
      lastSyncTime: new Date(),
      effectiveConnection: connection?.effectiveType || null
    });
  };

  useEffect(() => {
    const handleOnline = () => {
      updateStatus();
      toast.success('Back online!', {
        description: 'Syncing your changes...',
        duration: 3000
      });
      offlineQueue.processQueue();
    };

    const handleOffline = () => {
      updateStatus();
      toast.warning('You\'re offline', {
        description: 'Changes will sync when you reconnect',
        duration: 5000
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Subscribe to queue updates
    const unsubscribe = offlineQueue.subscribe(updateStatus);

    // Initial status
    updateStatus();

    // Check connection quality every 30 seconds
    const interval = setInterval(updateStatus, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const retryFailed = () => {
    offlineQueue.retryFailed();
    toast.info('Retrying failed actions...', {
      description: 'Please wait while we sync your data'
    });
  };

  const clearQueue = () => {
    offlineQueue.clearAll();
    toast.success('Queue cleared', {
      description: 'All pending actions removed'
    });
  };

  return {
    ...status,
    retryFailed,
    clearQueue,
    refresh: updateStatus
  };
};

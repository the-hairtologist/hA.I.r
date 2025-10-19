/**
 * Network Status Indicator
 * Shows online/offline status and syncs offline queue
 */

import { useState, useEffect } from 'react';
import { WifiOff, Wifi, CloudOff, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { offlineQueue } from '@/lib';

export const NetworkStatusIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [queueCount, setQueueCount] = useState(0);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      
      // Check if there are queued operations
      const status = offlineQueue.getStatus();
      if (status.size > 0) {
        setIsSyncing(true);
        setQueueCount(status.size);
        
        toast.info(`Syncing ${status.size} offline changes...`, {
          icon: <RefreshCw className="h-4 w-4 animate-spin" />,
        });

        try {
          await offlineQueue.processQueue();
          toast.success('All changes synced successfully!');
        } catch (error) {
          toast.error('Some changes failed to sync. Will retry later.');
        } finally {
          setIsSyncing(false);
          setQueueCount(0);
        }
      } else {
        toast.success('Back online!', {
          icon: <Wifi className="h-4 w-4" />,
        });
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('You are offline. Changes will be saved locally.', {
        icon: <WifiOff className="h-4 w-4" />,
        duration: 5000,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check queue status periodically
    const intervalId = setInterval(() => {
      const status = offlineQueue.getStatus();
      setQueueCount(status.size);
    }, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, []);

  // Don't show indicator if online and no queue
  if (isOnline && queueCount === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm transition-all',
        isOnline
          ? 'bg-green-500/90 text-white'
          : 'bg-destructive/90 text-destructive-foreground'
      )}
      role="status"
      aria-live="polite"
    >
      {isSyncing ? (
        <>
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span className="text-sm font-medium">
            Syncing {queueCount} {queueCount === 1 ? 'change' : 'changes'}...
          </span>
        </>
      ) : !isOnline ? (
        <>
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">
            Offline Mode
            {queueCount > 0 && ` (${queueCount} pending)`}
          </span>
        </>
      ) : queueCount > 0 ? (
        <>
          <CloudOff className="h-4 w-4" />
          <span className="text-sm font-medium">
            {queueCount} {queueCount === 1 ? 'change' : 'changes'} pending sync
          </span>
        </>
      ) : null}
    </div>
  );
};

/**
 * Offline Banner Component
 * Shows when user loses network connectivity
 */

import { useEffect, useState } from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff, Wifi } from 'lucide-react';
import { requestQueue } from '@/lib/errorRecovery';

export function OfflineBanner() {
  const networkStatus = useNetworkStatus();
  const [queuedCount, setQueuedCount] = useState(0);
  const [wasOffline, setWasOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);
  
  useEffect(() => {
    // Update queued requests count
    const interval = setInterval(() => {
      setQueuedCount(requestQueue.getQueueLength());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    if (!networkStatus.isOnline) {
      setWasOffline(true);
      setShowReconnected(false);
    } else if (wasOffline && networkStatus.isOnline) {
      // Just reconnected
      setShowReconnected(true);
      
      // Hide "reconnected" message after 5 seconds
      const timeout = setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, 5000);
      
      return () => clearTimeout(timeout);
    }
  }, [networkStatus.isOnline, wasOffline]);
  
  // Don't show anything if online and not just reconnected
  if (networkStatus.isOnline && !showReconnected) {
    return null;
  }
  
  // Show reconnected message
  if (showReconnected) {
    return (
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
        <Alert className="bg-success/10 border-success">
          <Wifi className="h-4 w-4 text-success" />
          <AlertDescription className="text-success">
            Back online! 
            {queuedCount > 0 && ` Syncing ${queuedCount} pending action${queuedCount > 1 ? 's' : ''}...`}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  // Show offline banner
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
      <Alert className="bg-destructive/10 border-destructive">
        <WifiOff className="h-4 w-4 text-destructive" />
        <AlertDescription className="text-destructive">
          You're offline. 
          {queuedCount > 0 
            ? ` ${queuedCount} action${queuedCount > 1 ? 's' : ''} queued and will sync when back online.`
            : ' Changes will sync when you reconnect.'
          }
        </AlertDescription>
      </Alert>
    </div>
  );
}

/**
 * Offline Indicator - Shows when user is disconnected
 * Mobile-first design with touch-friendly positioning
 */

import { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';

export const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        setShowReconnected(true);
        setTimeout(() => setShowReconnected(false), 3000);
        setWasOffline(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  // Show reconnected message briefly
  if (showReconnected) {
    return (
      <div
        className="fixed bottom-20 lg:bottom-4 left-1/2 -translate-x-1/2 z-[200] 
                   bg-success/90 backdrop-blur-sm text-success-foreground 
                   px-4 sm:px-6 py-3 rounded-full 
                   shadow-[4px_4px_0px_0px_rgba(0,0,0,0.25)] 
                   border-2 border-white/20
                   animate-fade-in
                   min-h-[44px] flex items-center gap-2
                   touch-manipulation"
        role="status"
        aria-live="polite"
      >
        <Wifi className="h-5 w-5 animate-pulse" aria-hidden="true" />
        <span className="font-medium text-sm sm:text-base">
          📡 Back online! Changes syncing...
        </span>
      </div>
    );
  }

  // Show offline indicator
  if (!isOnline) {
    return (
      <div
        className={cn(
          'fixed bottom-20 lg:bottom-4 left-1/2 -translate-x-1/2 z-[200]',
          'bg-warning/95 backdrop-blur-sm text-warning-foreground',
          'px-4 sm:px-6 py-3 rounded-full',
          'shadow-[4px_4px_0px_0px_rgba(0,0,0,0.25)]',
          'border-2 border-amber-600',
          'animate-bounce',
          'min-h-[44px] flex items-center gap-2',
          'touch-manipulation'
        )}
        role="alert"
        aria-live="assertive"
      >
        <WifiOff className="h-5 w-5" aria-hidden="true" />
        <span className="font-medium text-sm sm:text-base">
          📡 You're offline - Changes will sync later
        </span>
      </div>
    );
  }

  return null;
};

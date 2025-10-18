import { useEffect, useState } from 'react';
import { Scissors, WifiOff, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NetworkAwareLoaderProps {
  children: React.ReactNode;
  timeout?: number;
}

export const NetworkAwareLoader = ({ children, timeout = 8000 }: NetworkAwareLoaderProps) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showTimeout, setShowTimeout] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set timeout for loading
    const timer = setTimeout(() => {
      if (isLoading) {
        setShowTimeout(true);
      }
    }, timeout);

    // Mark as loaded once content is interactive
    const loadTimer = setTimeout(() => setIsLoading(false), 100);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearTimeout(timer);
      clearTimeout(loadTimer);
    };
  }, [timeout, isLoading]);

  const handleReload = () => {
    window.location.reload();
  };

  const handleClearCache = async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  if (!isOnline && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted">
        <div className="text-center p-8 bg-card brutal-border brutal-shadow-lg rounded-xl max-w-md">
          <WifiOff className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">You're Offline</h1>
          <p className="text-muted-foreground mb-6">
            Check your internet connection and try again
          </p>
          <button
            onClick={handleReload}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            <RefreshCw className="inline h-4 w-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (showTimeout) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted">
        <div className="text-center p-8 bg-card brutal-border brutal-shadow-lg rounded-xl max-w-md">
          <Scissors className="h-16 w-16 text-primary mx-auto mb-4 animate-pulse" />
          <h1 className="text-2xl font-bold mb-2">Taking longer than usual...</h1>
          <p className="text-muted-foreground mb-6">
            The app is loading slower than expected. This might be due to a slow connection.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleReload}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              <RefreshCw className="inline h-4 w-4 mr-2" />
              Reload
            </button>
            <button
              onClick={handleClearCache}
              className="px-6 py-2 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              Clear Cache
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Status: {isOnline ? '🟢 Online' : '🔴 Offline'}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

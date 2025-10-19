import { Suspense, useState, useEffect } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { Scissors, RefreshCw } from 'lucide-react';

interface TimeoutGuardProps {
  children: React.ReactNode;
  timeout?: number;
  fallbackMessage?: string;
}

const TimeoutFallback = ({ onRetry, connectionSpeed }: { onRetry: () => void; connectionSpeed: string }) => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted">
    <div className="text-center p-8 bg-card brutal-border brutal-shadow-lg rounded-xl max-w-md">
      <Scissors className="h-16 w-16 text-primary mx-auto mb-4 animate-pulse" />
      <h1 className="text-2xl font-bold mb-2">Loading is taking a while...</h1>
      <p className="text-muted-foreground mb-6">
        The page is taking longer than expected to load. Try refreshing.
      </p>
      <button
        onClick={onRetry}
        className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
      >
        <RefreshCw className="inline h-4 w-4 mr-2" />
        Refresh Page
      </button>
      {connectionSpeed !== 'unknown' && (
        <p className="text-xs text-muted-foreground mt-4">
          Connection: {connectionSpeed.toUpperCase()} {navigator.onLine ? '🟢 Online' : '🔴 Offline'}
        </p>
      )}
    </div>
  </div>
);

export const TimeoutGuard = ({ 
  children, 
  timeout = 20000, // Increased from 15s to 20s for mobile
  fallbackMessage = "Getting things ready..."
}: TimeoutGuardProps) => {
  const [showTimeout, setShowTimeout] = useState(false);
  const [connectionSpeed, setConnectionSpeed] = useState<string>('unknown');

  useEffect(() => {
    // Detect connection speed
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      const effectiveType = connection.effectiveType;
      setConnectionSpeed(effectiveType);
      
      // Adjust timeout based on connection
      let adjustedTimeout = timeout;
      if (effectiveType === 'slow-2g' || effectiveType === '2g') {
        adjustedTimeout = 25000;
      } else if (effectiveType === '3g') {
        adjustedTimeout = 18000;
      }
      
      const timer = setTimeout(() => {
        setShowTimeout(true);
      }, adjustedTimeout);

      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setShowTimeout(true);
      }, timeout);

      return () => clearTimeout(timer);
    }
  }, [timeout]);

  const handleRetry = () => {
    window.location.reload();
  };

  if (showTimeout) {
    return <TimeoutFallback onRetry={handleRetry} connectionSpeed={connectionSpeed} />;
  }

  return (
    <Suspense fallback={<LoadingSpinner message={fallbackMessage} />}>
      {children}
    </Suspense>
  );
};

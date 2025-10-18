import { Suspense, useState, useEffect } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { Scissors, RefreshCw } from 'lucide-react';

interface TimeoutGuardProps {
  children: React.ReactNode;
  timeout?: number;
  fallbackMessage?: string;
}

const TimeoutFallback = ({ onRetry }: { onRetry: () => void }) => (
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
    </div>
  </div>
);

export const TimeoutGuard = ({ 
  children, 
  timeout = 8000,
  fallbackMessage = "Getting things ready..."
}: TimeoutGuardProps) => {
  const [showTimeout, setShowTimeout] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTimeout(true);
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout]);

  const handleRetry = () => {
    window.location.reload();
  };

  if (showTimeout) {
    return <TimeoutFallback onRetry={handleRetry} />;
  }

  return (
    <Suspense fallback={<LoadingSpinner message={fallbackMessage} />}>
      {children}
    </Suspense>
  );
};

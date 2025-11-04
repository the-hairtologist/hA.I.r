/**
 * Enhanced Feature Error Boundary with Automatic Retry
 * Includes exponential backoff, network detection, and manual retry options
 */

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Loader2, WifiOff, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { logger } from '@/lib/logger';
import { captureError } from '@/lib/monitoring';

interface Props {
  children: ReactNode;
  featureName: string;
  fallback?: ReactNode;
  maxRetries?: number;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
  isRetrying: boolean;
  retryDelay: number;
  countdown: number;
  isSkipped: boolean;
}

export class EnhancedFeatureErrorBoundary extends Component<Props, State> {
  private retryTimer: NodeJS.Timeout | null = null;
  private countdownTimer: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRetrying: false,
      retryDelay: 1000, // Start with 1 second
      countdown: 0,
      isSkipped: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { featureName, onError } = this.props;

    // Log error
    logger.error(`Feature error in ${featureName}`, featureName, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      retryCount: this.state.retryCount,
    });

    // Send to monitoring
    try {
      captureError(error, {
        featureName,
        errorBoundary: 'EnhancedFeatureErrorBoundary',
        retryCount: this.state.retryCount,
        componentStack: errorInfo.componentStack,
      });
    } catch (e) {
      // Fail silently if monitoring is unavailable
    }

    this.setState({ errorInfo });

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }

    // Attempt automatic retry if network error and under max retries
    const maxRetries = this.props.maxRetries ?? 3;
    if (this.isNetworkError(error) && this.state.retryCount < maxRetries) {
      this.scheduleRetry();
    }
  }

  componentWillUnmount() {
    this.clearTimers();
  }

  clearTimers = () => {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
  };

  isNetworkError = (error: Error): boolean => {
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('timeout') ||
      message.includes('connection') ||
      message.includes('offline')
    );
  };

  scheduleRetry = () => {
    const { retryDelay } = this.state;
    
    this.setState({ 
      isRetrying: true,
      countdown: Math.ceil(retryDelay / 1000)
    });

    // Update countdown every second
    this.countdownTimer = setInterval(() => {
      this.setState(prev => ({
        countdown: Math.max(0, prev.countdown - 1)
      }));
    }, 1000);

    // Schedule actual retry
    this.retryTimer = setTimeout(() => {
      this.handleRetry();
    }, retryDelay);
  };

  handleRetry = () => {
    this.clearTimers();

    const newRetryCount = this.state.retryCount + 1;
    const newRetryDelay = Math.min(this.state.retryDelay * 2, 30000); // Cap at 30s

    logger.info(`Retrying ${this.props.featureName}`, this.props.featureName, {
      attempt: newRetryCount,
      nextDelay: newRetryDelay,
    });

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: newRetryCount,
      retryDelay: newRetryDelay,
      isRetrying: false,
      countdown: 0,
    });
  };

  handleManualRetry = () => {
    this.clearTimers();
    
    logger.info(`Manual retry for ${this.props.featureName}`, this.props.featureName);

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: this.state.retryCount + 1,
      isRetrying: false,
      countdown: 0,
    });
  };

  handleSkip = () => {
    this.clearTimers();
    
    logger.info(`Skipped ${this.props.featureName}`, this.props.featureName);

    this.setState({ isSkipped: true });
  };

  render() {
    const { children, featureName, fallback, maxRetries = 3 } = this.props;
    const { hasError, error, isRetrying, retryCount, countdown, isSkipped } = this.state;

    if (isSkipped) {
      return null; // Don't render anything if user skipped
    }

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      const isNetworkError = this.isNetworkError(error);
      const canRetry = retryCount < maxRetries;
      const isOffline = !navigator.onLine;

      return (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                {isOffline ? (
                  <WifiOff className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-destructive text-base">
                    {isOffline ? 'No Connection' : `${featureName} Unavailable`}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {isOffline
                      ? 'This feature requires an internet connection'
                      : isNetworkError
                        ? 'Network error occurred. This feature will retry automatically.'
                        : 'An error occurred while loading this feature'}
                  </CardDescription>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                {isRetrying && canRetry && (
                  <Badge variant="secondary" className="gap-1.5">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Retry {countdown}s
                  </Badge>
                )}
                {retryCount > 0 && (
                  <Badge variant="outline">
                    Attempt {retryCount}/{maxRetries}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Error message in dev mode */}
            {import.meta.env.DEV && (
              <div className="text-xs text-muted-foreground font-mono bg-muted/50 p-2 rounded border">
                {error.message}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              {!isRetrying && canRetry && (
                <Button
                  onClick={this.handleManualRetry}
                  size="sm"
                  variant="outline"
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
              )}
              
              {!isRetrying && (
                <Button
                  onClick={this.handleSkip}
                  size="sm"
                  variant="ghost"
                  className="gap-2"
                >
                  <SkipForward className="h-4 w-4" />
                  Skip This Feature
                </Button>
              )}

              {isOffline && (
                <div className="text-xs text-muted-foreground w-full">
                  ℹ️ Will retry automatically when connection is restored
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    return children;
  }
}

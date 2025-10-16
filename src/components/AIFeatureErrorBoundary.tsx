/**
 * Error Boundary for AI Features
 * Gracefully handles errors in AI-powered components
 */

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  featureName: string;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class AIFeatureErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[${this.props.featureName}] Error:`, error, errorInfo);
    this.setState({ errorInfo });

    // Log to error tracking service (optional)
    try {
      // @ts-ignore
      if (window.errorTracker) {
        // @ts-ignore
        window.errorTracker.captureException(error, {
          tags: {
            feature: this.props.featureName,
            component: 'AIFeatureErrorBoundary'
          },
          extra: errorInfo
        });
      }
    } catch (e) {
      // Silently fail if error tracking not available
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-4">
          <Alert variant="destructive" className="border-2">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="text-lg font-pixel">
              {this.props.featureName} Temporarily Unavailable
            </AlertTitle>
            <AlertDescription className="mt-2 space-y-3">
              <p className="text-sm">
                This feature encountered an unexpected issue. The error has been logged
                and our team will investigate.
              </p>
              
              {import.meta.env.DEV && this.state.error && (
                <details className="text-xs opacity-70">
                  <summary className="cursor-pointer">Error Details (dev only)</summary>
                  <pre className="mt-2 p-2 bg-black/10 rounded overflow-auto">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="ghost"
                  size="sm"
                >
                  Refresh Page
                </Button>
              </div>

              <p className="text-xs text-muted-foreground pt-2">
                If this problem persists, please contact support or use the standard
                AI Assistant features.
              </p>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

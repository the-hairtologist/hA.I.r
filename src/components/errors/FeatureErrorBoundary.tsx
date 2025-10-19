import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { logger } from '@/lib/logging/productionLogger';

interface Props {
  children: ReactNode;
  featureName: string;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Feature-Specific Error Boundary
 * Isolates errors to prevent full app crashes
 * Following Lovable best practices for graceful degradation
 */
export class FeatureErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { featureName, onError } = this.props;

    // Log to production logger
    logger.error(
      `Feature error in ${featureName}`,
      error,
      {
        component: featureName,
        action: 'feature_error',
        errorInfo: errorInfo.componentStack
      }
    );

    // Update state with error info
    this.setState({
      errorInfo
    });

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, featureName, fallback } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-lg">
                {featureName} Unavailable
              </CardTitle>
            </div>
            <CardDescription>
              We're having trouble loading this feature right now.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {import.meta.env.DEV && error && (
              <div className="rounded-lg bg-muted p-4 text-sm font-mono">
                <p className="font-semibold text-destructive mb-2">
                  Error: {error.message}
                </p>
                {error.stack && (
                  <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                    {error.stack}
                  </pre>
                )}
              </div>
            )}
            
            <div className="flex gap-2">
              <Button
                onClick={this.handleReset}
                variant="default"
                size="sm"
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
              >
                Reload Page
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              If this problem persists, please contact support with error code: {error?.name}
            </p>
          </CardContent>
        </Card>
      );
    }

    return children;
  }
}

/**
 * HOC for wrapping components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  featureName: string,
  fallback?: ReactNode
) {
  return function ErrorBoundaryWrapper(props: P) {
    return (
      <FeatureErrorBoundary featureName={featureName} fallback={fallback}>
        <Component {...props} />
      </FeatureErrorBoundary>
    );
  };
}

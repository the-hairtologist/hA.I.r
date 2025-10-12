import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorCount: number;
  lastError: number;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorCount: 0,
      lastError: 0,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error,
      errorCount: 0,
      lastError: Date.now(),
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Track error in production (could send to monitoring service)
    if (import.meta.env.PROD) {
      this.logErrorToService(error, errorInfo);
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
    
    // Show user-friendly toast
    toast.error('Something went wrong', {
      description: 'We\'re working to fix this issue',
    });
  }

  logErrorToService = (error: Error, errorInfo: React.ErrorInfo) => {
    // In production, send to error tracking service (silent logging)
  };

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorCount: this.state.errorCount + 1,
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Show retry option if error count is low
      const canRetry = this.state.errorCount < 3;

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <Card className="max-w-md w-full brutal-border shadow-brutal-2xl bg-red-400">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-card border-2 border-foreground flex items-center justify-center brutal-shadow-sm">
                  <AlertTriangle className="h-6 w-6 text-foreground" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-display text-foreground">Oops!</CardTitle>
                  <CardDescription className="text-foreground/80 font-medium">
                    Something went wrong
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-foreground/80 font-medium">
                We encountered an unexpected error. Don't worry, your data is safe!
              </p>

              {this.state.errorCount > 0 && (
                <div className="bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded-lg border-2 border-yellow-600">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                    This error has occurred {this.state.errorCount} time{this.state.errorCount !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
              
              {this.state.error && (
                <details className="text-xs bg-card p-3 rounded-lg brutal-border-subtle brutal-shadow-sm">
                  <summary className="cursor-pointer font-bold text-foreground mb-2">
                    Error Details (for support)
                  </summary>
                  <pre className="text-destructive overflow-auto max-h-32">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}

              <div className="flex flex-col gap-2 pt-2">
                {canRetry && (
                  <Button
                    onClick={this.handleReset}
                    className="w-full brutal-button brutal-hover"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                )}
                <div className="flex gap-2">
                  <Button
                    onClick={() => window.location.href = '/dashboard'}
                    variant={canRetry ? "outline" : "default"}
                    className="flex-1 brutal-button brutal-hover"
                  >
                    Go to Dashboard
                  </Button>
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                    className="flex-1 brutal-button brutal-hover"
                  >
                    Reload Page
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <Card className="max-w-md w-full border-[3px] border-foreground shadow-[8px_8px_0px_0px_hsl(var(--foreground))] bg-red-400">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-white border-2 border-foreground flex items-center justify-center shadow-[2px_2px_0px_0px_hsl(var(--foreground))]">
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
              
              {this.state.error && (
                <details className="text-xs bg-white p-3 rounded-lg border-2 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))]">
                  <summary className="cursor-pointer font-bold text-foreground mb-2">
                    Error Details (for support)
                  </summary>
                  <pre className="text-destructive overflow-auto">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => window.location.href = '/dashboard'}
                  className="flex-1 border-2 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))] hover:shadow-[3px_3px_0px_0px_hsl(var(--foreground))] hover:-translate-y-0.5 transition-all"
                >
                  Go to Dashboard
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="flex-1 border-2 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))] hover:shadow-[3px_3px_0px_0px_hsl(var(--foreground))] hover:-translate-y-0.5 transition-all"
                >
                  Reload Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

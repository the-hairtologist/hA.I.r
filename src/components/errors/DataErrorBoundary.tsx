/**
 * Data Error Boundary
 * Catches data-related errors and provides graceful fallbacks
 */

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { logger } from '@/lib/logging/productionLogger';
import { userJourney } from '@/lib/logging/userJourneyTracker';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  feature?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  showDetails: boolean;
}

export class DataErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { feature = 'Unknown' } = this.props;

    // Log error
    logger.error(`DataErrorBoundary caught error in ${feature}`, error, {
      context: 'DataErrorBoundary',
      data: {
        feature,
        componentStack: errorInfo.componentStack
      }
    });

    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    });

    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="flex-1">
                <CardTitle className="text-base">Unable to Load Data</CardTitle>
                <CardDescription className="mt-1">
                  {this.props.feature ? (
                    <>There was a problem loading <strong>{this.props.feature}</strong> data.</>
                  ) : (
                    'There was a problem loading this data.'
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={this.handleReset}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              {import.meta.env.DEV && (
                <Button
                  onClick={this.toggleDetails}
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                >
                  <ChevronDown 
                    className={`h-4 w-4 transition-transform ${
                      this.state.showDetails ? 'rotate-180' : ''
                    }`} 
                  />
                  {this.state.showDetails ? 'Hide' : 'Show'} Details
                </Button>
              )}
            </div>

            {import.meta.env.DEV && this.state.showDetails && this.state.error && (
              <div className="rounded-md bg-muted p-3 text-xs font-mono overflow-auto max-h-48">
                <div className="text-destructive font-bold mb-2">
                  {this.state.error.toString()}
                </div>
                <div className="text-muted-foreground whitespace-pre-wrap">
                  {this.state.errorInfo?.componentStack}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

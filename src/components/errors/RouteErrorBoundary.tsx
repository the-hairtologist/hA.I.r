/**
 * Route-Level Error Boundary
 * Catches errors within specific routes without breaking the entire app
 */

import React from 'react';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { logger } from '@/lib/logger';

interface Props {
  children: React.ReactNode;
  fallbackRoute?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class RouteErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('Route Error Boundary caught error', 'RouteErrorBoundary', error);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <RouteErrorFallback
          error={this.state.error}
          onReset={this.handleReset}
          fallbackRoute={this.props.fallbackRoute}
        />
      );
    }

    return this.props.children;
  }
}

interface FallbackProps {
  error: Error | null;
  onReset: () => void;
  fallbackRoute?: string;
}

const RouteErrorFallback: React.FC<FallbackProps> = ({ error, onReset, fallbackRoute = '/dashboard' }) => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Page Error</AlertTitle>
        <AlertDescription>
          This page encountered an error. You can try reloading or go back to the previous page.
        </AlertDescription>
      </Alert>

      {error && (
        <div className="mb-4 p-4 rounded-lg bg-muted">
          <p className="font-mono text-sm text-muted-foreground">
            {error.message}
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <Button onClick={onReset} variant="default">
          Try Again
        </Button>
        <Button onClick={() => navigate(-1)} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
        <Button onClick={() => navigate(fallbackRoute)} variant="ghost">
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
};

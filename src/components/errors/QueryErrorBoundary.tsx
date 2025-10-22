/**
 * Query Error Boundary
 * Specialized error boundary for React Query errors
 */

import { Component, ReactNode } from "react";
import { ErrorRecovery } from "@/components/ui/ErrorRecovery";
import { logger } from "@/lib/logger";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class QueryErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    logger.error('Query Error Boundary caught error', 'QueryErrorBoundary', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorRecovery
          error={this.state.error}
          onRetry={this.handleReset}
          actionLabel="Try Again"
          variant="card"
        />
      );
    }

    return this.props.children;
  }
}

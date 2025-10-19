import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Camera, Mic, RefreshCw, Upload } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackType?: 'camera' | 'microphone' | 'general';
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary specifically for Camera/Microphone components
 * Provides graceful fallback with file upload option
 */
export class MediaErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('MediaErrorBoundary caught error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    this.props.onReset?.();
  };

  getErrorDetails() {
    const { fallbackType = 'general' } = this.props;
    const { error } = this.state;

    // Check for permission errors
    if (error?.message?.includes('permission') || error?.message?.includes('NotAllowedError')) {
      return {
        icon: fallbackType === 'camera' ? Camera : Mic,
        title: `${fallbackType === 'camera' ? 'Camera' : 'Microphone'} Permission Denied`,
        description: `We need ${fallbackType} access to use this feature. Please enable it in your browser settings.`,
        actions: [
          { label: 'Try Again', action: this.handleReset },
          { label: 'Use File Upload', action: () => {} }
        ]
      };
    }

    // Check for device not found
    if (error?.message?.includes('NotFoundError') || error?.message?.includes('not found')) {
      return {
        icon: AlertTriangle,
        title: `No ${fallbackType === 'camera' ? 'Camera' : 'Microphone'} Found`,
        description: `Your device doesn't have a ${fallbackType} or it's being used by another app.`,
        actions: [
          { label: 'Try Again', action: this.handleReset },
          { label: 'Use File Upload', action: () => {} }
        ]
      };
    }

    // Check for device busy
    if (error?.message?.includes('NotReadableError') || error?.message?.includes('in use')) {
      return {
        icon: AlertTriangle,
        title: `${fallbackType === 'camera' ? 'Camera' : 'Microphone'} Unavailable`,
        description: `Another app is using your ${fallbackType}. Please close it and try again.`,
        actions: [
          { label: 'Try Again', action: this.handleReset }
        ]
      };
    }

    // Generic error
    return {
      icon: AlertTriangle,
      title: 'Media Feature Error',
      description: error?.message || 'An unexpected error occurred with the media feature.',
      actions: [
        { label: 'Try Again', action: this.handleReset }
      ]
    };
  }

  render() {
    if (this.state.hasError) {
      const details = this.getErrorDetails();
      const Icon = details.icon;

      return (
        <Card className="border-destructive/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-destructive/10">
                <Icon className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <CardTitle className="text-lg">{details.title}</CardTitle>
                <CardDescription className="text-sm mt-1">
                  {details.description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Error details for debugging */}
              {import.meta.env.DEV && this.state.error && (
                <details className="p-3 rounded-lg bg-muted text-xs">
                  <summary className="cursor-pointer font-medium mb-2">
                    Technical Details (Dev Only)
                  </summary>
                  <pre className="whitespace-pre-wrap overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 flex-wrap">
                {details.actions.map((action, i) => (
                  <Button
                    key={i}
                    variant={i === 0 ? "default" : "outline"}
                    onClick={action.action}
                    size="sm"
                  >
                    {i === 0 && <RefreshCw className="h-4 w-4 mr-2" />}
                    {i === 1 && <Upload className="h-4 w-4 mr-2" />}
                    {action.label}
                  </Button>
                ))}
              </div>

              {/* Help text */}
              <p className="text-xs text-muted-foreground border-t pt-3">
                💡 <strong>Troubleshooting Tips:</strong>
                <br />
                • Check your browser permissions (look for the 🔒 icon in the address bar)
                <br />
                • Make sure no other apps are using your {this.props.fallbackType}
                <br />
                • Try refreshing the page
                <br />
                • Use a different browser if the problem persists
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

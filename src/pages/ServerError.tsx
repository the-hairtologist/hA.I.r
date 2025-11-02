import { Link } from 'react-router-dom';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEOHead } from '@/components/SEOHead';

const ServerError = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <>
      <SEOHead
        title="Server Error - hA.I.r"
        description="Something went wrong on our end. We're working to fix it."
      />
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-destructive/10 via-secondary/10 to-accent/10 p-4">
        <div className="text-center max-w-md mx-auto p-8 bg-card border-[3px] border-foreground rounded-xl shadow-[8px_8px_0px_0px_hsl(var(--foreground))] animate-fade-in">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-destructive/20 flex items-center justify-center">
                <AlertTriangle className="h-16 w-16 text-destructive animate-pulse" />
              </div>
              <div className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full h-12 w-12 flex items-center justify-center font-bold text-lg border-2 border-foreground">
                500
              </div>
            </div>
          </div>

          <h1 className="mb-4 text-4xl font-bold font-pixel text-foreground">
            Server Error
          </h1>

          <p className="mb-8 text-lg font-sans text-muted-foreground">
            Something went wrong on our end. Our team has been notified and is
            working on a fix.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={handleRefresh} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>

            <Button asChild className="gap-2">
              <Link to="/">
                <Home className="h-4 w-4" />
                Return Home
              </Link>
            </Button>
          </div>

          <div className="mt-8 p-4 bg-muted rounded-lg border-2 border-border">
            <p className="text-sm text-muted-foreground mb-2">
              <strong>Need immediate help?</strong>
            </p>
            <p className="text-sm text-muted-foreground">
              Contact us at support@hair-app.com
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServerError;

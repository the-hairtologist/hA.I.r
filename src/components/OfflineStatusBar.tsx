import { WifiOff, Wifi, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import { cn } from "@/lib/utils";

export const OfflineStatusBar = () => {
  const { isOnline, pendingActions, failedActions, effectiveConnection, retryFailed } = useOfflineStatus();

  // Don't show if online and no pending actions
  if (isOnline && pendingActions === 0 && failedActions === 0) {
    return null;
  }

  const getConnectionQuality = () => {
    if (!isOnline) return 'offline';
    switch (effectiveConnection) {
      case 'slow-2g':
      case '2g':
        return 'poor';
      case '3g':
        return 'fair';
      case '4g':
      case '5g':
        return 'good';
      default:
        return 'unknown';
    }
  };

  const quality = getConnectionQuality();

  return (
    <div 
      className={cn(
        "fixed top-0 left-0 right-0 z-fixed px-4 py-2 backdrop-blur-lg border-b transition-all animate-in slide-in-from-top-2",
        quality === 'offline' && "bg-destructive/90 border-destructive text-destructive-foreground",
        quality === 'poor' && "bg-warning/90 border-warning text-warning-foreground",
        quality === 'fair' && "bg-info/90 border-info text-info-foreground",
        (pendingActions > 0 || failedActions > 0) && isOnline && "bg-primary/90 border-primary text-primary-foreground"
      )}
    >
      <div className="container max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {!isOnline ? (
            <WifiOff className="h-5 w-5" />
          ) : pendingActions > 0 ? (
            <RefreshCw className="h-5 w-5 animate-spin" />
          ) : failedActions > 0 ? (
            <AlertTriangle className="h-5 w-5" />
          ) : (
            <CheckCircle2 className="h-5 w-5" />
          )}
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">
              {!isOnline && "You're offline"}
              {isOnline && pendingActions > 0 && `Syncing ${pendingActions} ${pendingActions === 1 ? 'change' : 'changes'}...`}
              {isOnline && pendingActions === 0 && failedActions > 0 && `${failedActions} ${failedActions === 1 ? 'action' : 'actions'} failed`}
            </p>
            <p className="text-xs opacity-80">
              {!isOnline && "Changes will sync automatically when you reconnect"}
              {isOnline && pendingActions > 0 && "Your changes are being saved"}
              {isOnline && pendingActions === 0 && failedActions > 0 && "Tap retry to sync again"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {quality === 'poor' && isOnline && (
            <span className="text-xs opacity-80 hidden sm:inline">
              Slow connection
            </span>
          )}
          
          {failedActions > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={retryFailed}
              className="hover:bg-background/20 h-8"
            >
              <RefreshCw className="h-5 w-5 sm:h-6 sm:w-6 mr-1" />
              Retry
            </Button>
          )}
        </div>
      </div>

      {pendingActions > 0 && (
        <Progress 
          value={0} 
          className="h-1 mt-2 bg-background/20" 
          style={{ 
            animation: 'progress 2s ease-in-out infinite'
          }}
        />
      )}
    </div>
  );
};

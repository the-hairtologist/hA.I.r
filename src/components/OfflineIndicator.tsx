import { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-fixed animate-fade-in",
        "transition-transform duration-300"
      )}
      role="alert"
      aria-live="assertive"
    >
      <Alert
        className={cn(
          "rounded-none border-x-0 border-t-0",
          isOnline
            ? "bg-success/10 border-success/30 dark:bg-success/20 dark:border-success/40"
            : "bg-destructive/10 border-destructive/50"
        )}
      >
        <div className="flex items-center gap-3">
          {isOnline ? (
            <Wifi className="h-5 w-5 sm:h-6 sm:w-6 text-success" />
          ) : (
            <WifiOff className="h-5 w-5 sm:h-6 sm:w-6 text-destructive" />
          )}
          <AlertDescription className="text-sm font-medium">
            {isOnline
              ? "Connection restored. You're back online."
              : "No internet connection. Some features may be unavailable."}
          </AlertDescription>
        </div>
      </Alert>
    </div>
  );
};

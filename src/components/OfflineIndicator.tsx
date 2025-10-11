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
        "fixed top-0 left-0 right-0 z-50 animate-fade-in",
        "transition-transform duration-300"
      )}
      role="alert"
      aria-live="assertive"
    >
      <Alert
        className={cn(
          "rounded-none border-x-0 border-t-0",
          isOnline
            ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
            : "bg-destructive/10 border-destructive/50"
        )}
      >
        <div className="flex items-center gap-3">
          {isOnline ? (
            <Wifi className="h-4 w-4 text-green-600 dark:text-green-400" />
          ) : (
            <WifiOff className="h-4 w-4 text-destructive" />
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

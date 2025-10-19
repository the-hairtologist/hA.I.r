/**
 * Service Worker Update Notification
 * Prompts users when a new version is available
 */

import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const ServiceWorkerUpdate = () => {
  const [offlineReady, setOfflineReady] = useState(false);
  const [needRefresh, setNeedRefresh] = useState(false);

  useEffect(() => {
    // Simple SW check without vite-plugin-pwa React hook
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        setOfflineReady(true);
      });
    }
  }, []);

  useEffect(() => {
    if (offlineReady) {
      toast.success('App is ready to work offline!', {
        duration: 3000,
      });
    }
  }, [offlineReady]);

  useEffect(() => {
    if (needRefresh) {
      toast(
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-medium">New version available!</div>
            <div className="text-sm text-muted-foreground">
              Click update to get the latest features
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => {
              window.location.reload();
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Update
          </Button>
        </div>,
        {
          duration: 10000,
          dismissible: true,
          closeButton: true,
        }
      );
    }
  }, [needRefresh]);

  // This component doesn't render anything visible
  return null;
};

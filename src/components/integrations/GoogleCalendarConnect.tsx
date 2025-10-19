import { useState, useEffect } from 'react';
import { Calendar, Check, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export function GoogleCalendarConnect() {
  const { 
    connecting,
    connectGoogleCalendar,
    disconnectCalendar,
    checkConnection 
  } = useCalendarSync();
  
  const [connection, setConnection] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConnection();
  }, []);

  const loadConnection = async () => {
    setLoading(true);
    try {
      const conn = await checkConnection();
      setConnection(conn);
    } catch (error) {
      toast.error('Failed to check calendar connection');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    toast.info('Refreshing connection status...');
    await loadConnection();
    toast.success('Connection status updated');
  };

  const handleConnect = async () => {
    await connectGoogleCalendar();
  };

  const handleDisconnect = async () => {
    await disconnectCalendar();
    setConnection(null);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
            <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Google Calendar</h3>
              {connection ? (
                <Badge variant="default" className="gap-1">
                  <Check className="h-3 w-3" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="secondary">Not Connected</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {connection
                ? 'Your appointments automatically sync to your Google Calendar'
                : 'Sync appointments to your Google Calendar automatically'}
            </p>
            {connection?.sync_enabled && (
              <div className="mt-2 text-xs text-muted-foreground">
                Last synced: {new Date(connection.last_sync_at || connection.created_at).toLocaleString()}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {connection ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDisconnect}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Disconnect
            </Button>
          ) : (
            <Button
              onClick={handleConnect}
              disabled={connecting}
              className="gap-2"
            >
              <Calendar className="h-4 w-4" />
              {connecting ? 'Connecting...' : 'Connect'}
            </Button>
          )}
        </div>
      </div>

      {!connection && (
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm font-medium mb-2">Benefits of connecting:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Appointments automatically added to your calendar</li>
            <li>• Updates sync in real-time</li>
            <li>• Never double-book again</li>
            <li>• Get calendar reminders on your phone</li>
          </ul>
        </div>
      )}
    </Card>
  );
}

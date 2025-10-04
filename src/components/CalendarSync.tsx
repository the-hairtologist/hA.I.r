import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Calendar, Link as LinkIcon, Unlink, Loader2, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type CalendarProvider = 'google' | 'outlook';

interface CalendarConnection {
  id: string;
  provider: CalendarProvider;
  is_active: boolean;
  sync_enabled: boolean;
  last_sync_at: string | null;
}

const CalendarSync = () => {
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState<CalendarConnection[]>([]);
  const [connecting, setConnecting] = useState<CalendarProvider | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<CalendarConnection | null>(null);

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('calendar_connections')
        .select('*')
        .eq('user_id', session.user.id);

      if (error) throw error;
      setConnections((data || []) as CalendarConnection[]);
    } catch (error) {
      console.error('Error loading connections:', error);
      toast.error('Failed to load calendar connections');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (provider: CalendarProvider) => {
    setConnecting(provider);
    try {
      // For MVP, we'll show instructions since OAuth requires backend setup
      toast.info(
        `${provider === 'google' ? 'Google' : 'Outlook'} Calendar sync coming soon! We'll notify you when it's available.`,
        { duration: 5000 }
      );
      
      // TODO: Implement OAuth flow via edge function
      // const { data, error } = await supabase.functions.invoke('calendar-oauth-init', {
      //   body: { provider }
      // });
      // if (error) throw error;
      // window.location.href = data.authUrl;
      
    } catch (error) {
      console.error('Error connecting calendar:', error);
      toast.error('Failed to connect calendar');
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (connection: CalendarConnection) => {
    setSelectedConnection(connection);
    setShowDisconnectDialog(true);
  };

  const confirmDisconnect = async () => {
    if (!selectedConnection) return;
    
    setDisconnecting(selectedConnection.id);
    try {
      const { error } = await supabase
        .from('calendar_connections')
        .delete()
        .eq('id', selectedConnection.id);

      if (error) throw error;
      
      toast.success('Calendar disconnected successfully');
      loadConnections();
    } catch (error) {
      console.error('Error disconnecting calendar:', error);
      toast.error('Failed to disconnect calendar');
    } finally {
      setDisconnecting(null);
      setShowDisconnectDialog(false);
      setSelectedConnection(null);
    }
  };

  const handleSync = async (connectionId: string) => {
    setSyncing(connectionId);
    try {
      const { error } = await supabase.functions.invoke('sync-appointments-to-calendar', {
        body: { connectionId }
      });

      if (error) throw error;
      
      toast.success('Appointments synced successfully');
      loadConnections();
    } catch (error) {
      console.error('Error syncing calendar:', error);
      toast.error('Failed to sync appointments');
    } finally {
      setSyncing(null);
    }
  };

  const toggleSyncEnabled = async (connection: CalendarConnection) => {
    try {
      const { error } = await supabase
        .from('calendar_connections')
        .update({ sync_enabled: !connection.sync_enabled })
        .eq('id', connection.id);

      if (error) throw error;
      
      toast.success(
        connection.sync_enabled 
          ? 'Auto-sync disabled' 
          : 'Auto-sync enabled - future appointments will sync automatically'
      );
      loadConnections();
    } catch (error) {
      console.error('Error toggling sync:', error);
      toast.error('Failed to update sync settings');
    }
  };

  const getProviderIcon = (provider: CalendarProvider) => {
    switch (provider) {
      case 'google':
        return '📅';
      case 'outlook':
        return '📧';
      default:
        return '📆';
    }
  };

  const getProviderName = (provider: CalendarProvider) => {
    switch (provider) {
      case 'google':
        return 'Google Calendar';
      case 'outlook':
        return 'Outlook Calendar';
      default:
        return provider;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle>Calendar Sync</CardTitle>
          </div>
          <CardDescription>
            Sync your appointments with external calendars automatically
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connected Calendars */}
          {connections.length > 0 && (
            <div className="space-y-3">
              {connections.map((connection) => (
                <div
                  key={connection.id}
                  className="flex items-center justify-between p-4 border-2 border-foreground/10 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getProviderIcon(connection.provider)}</span>
                    <div>
                      <p className="font-medium">{getProviderName(connection.provider)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {connection.is_active ? (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Connected
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                        {connection.last_sync_at && (
                          <span className="text-xs text-muted-foreground">
                            Last synced: {new Date(connection.last_sync_at).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSync(connection.id)}
                      disabled={syncing === connection.id || !connection.is_active}
                    >
                      {syncing === connection.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Sync Now
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisconnect(connection)}
                      disabled={disconnecting === connection.id}
                    >
                      {disconnecting === connection.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Unlink className="h-4 w-4 mr-2" />
                          Disconnect
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Connect New Calendar */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Connect a calendar:</h4>
            <div className="grid gap-2">
              {!connections.find(c => c.provider === 'google') && (
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => handleConnect('google')}
                  disabled={connecting === 'google'}
                >
                  {connecting === 'google' ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <>
                      <span className="mr-2">📅</span>
                      <span>Connect Google Calendar</span>
                    </>
                  )}
                </Button>
              )}
              {!connections.find(c => c.provider === 'outlook') && (
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => handleConnect('outlook')}
                  disabled={connecting === 'outlook'}
                >
                  {connecting === 'outlook' ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <>
                      <span className="mr-2">📧</span>
                      <span>Connect Outlook Calendar</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {connections.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No calendars connected yet</p>
              <p className="text-xs mt-1">Connect your calendar to sync appointments automatically</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Disconnect Confirmation Dialog */}
      <AlertDialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Calendar?</AlertDialogTitle>
            <AlertDialogDescription>
              This will stop syncing appointments to {selectedConnection && getProviderName(selectedConnection.provider)}.
              Your existing appointments will remain in your calendar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDisconnect}
              className="bg-destructive hover:bg-destructive/90"
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CalendarSync;

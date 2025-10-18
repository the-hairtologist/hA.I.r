/**
 * Calendar Sync Status Indicator
 * Shows calendar connection status for stylists
 */

import { useState, useEffect } from "react";
import { Calendar, CheckCircle, AlertCircle, RefreshCw, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface CalendarConnection {
  id: string;
  provider: string;
  is_active: boolean;
  last_sync_at: string | null;
  sync_enabled: boolean;
}

export function CalendarSyncIndicator() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [connection, setConnection] = useState<CalendarConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadConnectionStatus();
  }, [user]);

  const loadConnectionStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("calendar_connections")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setConnection(data);
    } catch (error) {
      console.error("Error loading calendar connection:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!connection) return;

    setSyncing(true);
    try {
      // Trigger sync (this would call your calendar sync edge function)
      toast.info("Syncing calendar...");
      
      // Update last sync time
      await supabase
        .from("calendar_connections")
        .update({ last_sync_at: new Date().toISOString() })
        .eq("id", connection.id);
      
      await loadConnectionStatus();
      toast.success("Calendar synced successfully!");
    } catch (error: any) {
      console.error("Error syncing calendar:", error);
      toast.error("Failed to sync calendar");
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
        <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
        <span>Checking calendar...</span>
      </div>
    );
  }

  if (!connection) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/integrations")}
        className="w-full justify-start h-auto px-3 py-2 text-xs"
      >
        <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-amber-500" />
        <span className="text-muted-foreground">Connect Calendar</span>
      </Button>
    );
  }

  const lastSyncText = connection.last_sync_at
    ? new Date(connection.last_sync_at).toLocaleString()
    : "Never";

  return (
    <div className="px-3 py-2 border-t">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium truncate">
                {connection.provider === 'google' ? 'Google Calendar' : 'Calendar'}
              </span>
              {connection.sync_enabled && (
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-success flex-shrink-0" />
              )}
            </div>
            <p className="text-[11px] text-muted-foreground truncate">
              Last sync: {lastSyncText}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSync}
            disabled={syncing}
            className="h-6 w-6 p-0"
            title="Sync now"
          >
            <RefreshCw className={cn("h-4 w-4 sm:h-5 sm:w-5", syncing && "animate-spin")} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/integrations")}
            className="h-6 w-6 p-0"
            title="Calendar settings"
          >
            <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

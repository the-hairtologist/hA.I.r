import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { log } from '@/lib/logger';

export function useCalendarSync() {
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const connectGoogleCalendar = useCallback(async () => {
    try {
      setConnecting(true);

      // Fetch Google Client ID from backend
      const { data: config, error: configError } =
        await supabase.functions.invoke('google-client-config');

      if (configError || !config?.clientId) {
        throw new Error('Google Calendar integration not configured');
      }

      const redirectUri = `${window.location.origin}/integrations/calendar`;
      const params = new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'https://www.googleapis.com/auth/calendar.events',
        access_type: 'offline',
        prompt: 'consent',
      });

      // Open OAuth window
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
      window.location.href = authUrl;
    } catch (error: any) {
      log.error('Calendar connection error', 'useCalendarSync', error);
      toast.error(error.message || 'Failed to connect calendar');
    } finally {
      setConnecting(false);
    }
  }, []);

  const handleOAuthCallback = useCallback(async (code: string) => {
    try {
      setConnecting(true);

      const { data, error } = await supabase.functions.invoke(
        'google-calendar-oauth',
        {
          body: {
            code,
            redirect_uri: `${window.location.origin}/integrations/calendar`,
          },
        }
      );

      if (error) throw error;

      toast.success('Google Calendar connected successfully!');
      log.info('Calendar connected', 'useCalendarSync', data);

      return data;
    } catch (error: any) {
      log.error('OAuth callback error', 'useCalendarSync', error);
      toast.error(error.message || 'Failed to complete calendar connection');
      throw error;
    } finally {
      setConnecting(false);
    }
  }, []);

  const syncAppointment = useCallback(
    async (
      appointmentId: string,
      action: 'create' | 'update' | 'delete' = 'create'
    ) => {
      try {
        setSyncing(true);

        const { data, error } = await supabase.functions.invoke(
          'sync-calendar-event',
          {
            body: { appointment_id: appointmentId, action },
          }
        );

        if (error) throw error;

        if (data?.success) {
          log.info(`Appointment ${action}d in calendar`, 'useCalendarSync', {
            appointmentId,
          });
        }

        return data;
      } catch (error: any) {
        log.warn('Calendar sync failed', 'useCalendarSync', error);
        // Don't show error toast - syncing is optional
      } finally {
        setSyncing(false);
      }
    },
    []
  );

  const disconnectCalendar = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('calendar_connections')
        .update({ is_active: false, sync_enabled: false })
        .eq('user_id', user.id)
        .eq('provider', 'google');

      if (error) throw error;

      toast.success('Calendar disconnected');
      log.info('Calendar disconnected', 'useCalendarSync');
    } catch (error: any) {
      log.error('Calendar disconnect error', 'useCalendarSync', error);
      toast.error(error.message || 'Failed to disconnect calendar');
    }
  }, []);

  const checkConnection = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('calendar_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('provider', 'google')
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error: any) {
      log.error('Check connection error', 'useCalendarSync', error);
      return null;
    }
  }, []);

  return {
    connecting,
    syncing,
    connectGoogleCalendar,
    handleOAuthCallback,
    syncAppointment,
    disconnectCalendar,
    checkConnection,
  };
}

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { analytics } from '@/lib/analytics';

interface CalendarEvent {
  id?: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  location?: string;
}

export const useGoogleCalendar = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const connectGoogleCalendar = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-calendar-connect');
      
      if (error) throw error;
      
      if (data?.authUrl) {
        window.location.href = data.authUrl;
        analytics.track('google_calendar_connect_started');
      }
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
      toast.error('Failed to connect to Google Calendar');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const syncAppointment = useCallback(async (event: CalendarEvent) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-calendar-sync', {
        body: { event }
      });
      
      if (error) throw error;
      
      toast.success('Appointment synced to Google Calendar');
      analytics.track('appointment_synced_to_calendar', { event_id: data?.eventId });
      return data;
    } catch (error) {
      console.error('Error syncing to Google Calendar:', error);
      toast.error('Failed to sync appointment');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnectGoogleCalendar = useCallback(async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('google-calendar-disconnect');
      
      if (error) throw error;
      
      setIsConnected(false);
      toast.success('Disconnected from Google Calendar');
      analytics.track('google_calendar_disconnected');
    } catch (error) {
      console.error('Error disconnecting from Google Calendar:', error);
      toast.error('Failed to disconnect');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isConnected,
    isLoading,
    connectGoogleCalendar,
    syncAppointment,
    disconnectGoogleCalendar
  };
};

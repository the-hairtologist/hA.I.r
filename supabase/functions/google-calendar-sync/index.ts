import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CALENDAR-SYNC] ${step}${detailsStr}`);
};

serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Function started');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header provided');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } =
      await supabase.auth.getUser(token);

    if (userError || !userData.user) {
      throw new Error('User not authenticated');
    }

    const user = userData.user;
    logStep('User authenticated', { userId: user.id });

    const { appointmentId } = await req.json();

    if (!appointmentId) {
      throw new Error('Appointment ID is required');
    }

    // Get appointment with related data
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select(
        `
        *,
        client:client_profiles!appointments_client_id_fkey(full_name, email),
        stylist:stylist_profiles!appointments_stylist_id_fkey(business_name)
      `
      )
      .eq('id', appointmentId)
      .single();

    if (appointmentError) {
      throw new Error(
        `Failed to fetch appointment: ${appointmentError.message}`
      );
    }

    logStep('Appointment fetched', { appointmentId });

    // Get calendar connection
    const { data: connection, error: connectionError } = await supabase
      .from('calendar_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider', 'google')
      .eq('is_active', true)
      .maybeSingle();

    if (connectionError || !connection) {
      throw new Error('No active Google Calendar connection found');
    }

    // Get tokens using RPC function
    const { data: tokens, error: tokensError } = await supabase.rpc(
      'get_calendar_token',
      { p_connection_id: connection.id }
    );

    if (tokensError || !tokens || tokens.length === 0) {
      throw new Error('Failed to retrieve calendar tokens');
    }

    const [accessToken] = tokens[0];
    logStep('Tokens retrieved');

    // Create calendar event
    const startTime = new Date(appointment.appointment_date);
    const endTime = new Date(
      startTime.getTime() + (appointment.duration_minutes || 60) * 60000
    );

    const calendarEvent = {
      summary: `${appointment.service_type} - ${appointment.client?.full_name || 'Client'}`,
      description: `Service: ${appointment.service_type}\nStatus: ${appointment.status}${appointment.notes ? `\n\nNotes: ${appointment.notes}` : ''}`,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'America/New_York',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'America/New_York',
      },
      attendees: appointment.client?.email
        ? [{ email: appointment.client.email }]
        : [],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 60 },
        ],
      },
    };

    const calendarResponse = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(calendarEvent),
      }
    );

    if (!calendarResponse.ok) {
      const errorText = await calendarResponse.text();
      throw new Error(`Google Calendar API error: ${errorText}`);
    }

    const googleEvent = await calendarResponse.json();
    logStep('Event created in Google Calendar', { eventId: googleEvent.id });

    // Store event mapping
    await supabase.from('appointment_calendar_events').upsert({
      appointment_id: appointmentId,
      calendar_connection_id: connection.id,
      external_event_id: googleEvent.id,
      provider: 'google',
      sync_status: 'synced',
    });

    // Update last sync time
    await supabase
      .from('calendar_connections')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', connection.id);

    return new Response(
      JSON.stringify({
        success: true,
        eventId: googleEvent.id,
        eventLink: googleEvent.htmlLink,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    logStep('ERROR in calendar-sync', { message: error.message });

    return new Response(
      JSON.stringify({
        error: error.message || 'An unexpected error occurred',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

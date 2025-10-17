import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    
    if (!user) throw new Error('Unauthorized');

    const { connectionId } = await req.json();
    console.log('🔄 Syncing appointments to calendar:', connectionId);

    // Get calendar connection
    const { data: connection, error: connError } = await supabase
      .from('calendar_connections')
      .select('*')
      .eq('id', connectionId)
      .eq('user_id', user.id)
      .single();

    if (connError || !connection) {
      throw new Error('Calendar connection not found');
    }

    // Get pending appointments for the user
    const { data: appointments, error: apptError } = await supabase
      .from('appointments')
      .select('*')
      .or(`stylist_id.eq.${user.id},client_id.eq.${user.id}`)
      .gte('start_time', new Date().toISOString())
      .is('calendar_event_id', null)
      .limit(50);

    if (apptError) throw apptError;

    if (!appointments || appointments.length === 0) {
      console.log('✅ No appointments to sync');
      return new Response(JSON.stringify({ synced: 0, message: 'No appointments to sync' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Sync each appointment to calendar
    const syncResults = [];
    for (const appointment of appointments) {
      try {
        // Create calendar event via Google Calendar API
        const event = {
          summary: `Hair Appointment - ${appointment.service_type || 'Service'}`,
          description: appointment.notes || '',
          start: {
            dateTime: appointment.start_time,
            timeZone: 'America/New_York',
          },
          end: {
            dateTime: appointment.end_time,
            timeZone: 'America/New_York',
          },
        };

        const calendarResponse = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${connection.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(event),
          }
        );

        if (calendarResponse.ok) {
          const calendarEvent = await calendarResponse.json();
          
          // Update appointment with calendar event ID
          await supabase
            .from('appointments')
            .update({ calendar_event_id: calendarEvent.id })
            .eq('id', appointment.id);

          syncResults.push({ id: appointment.id, status: 'synced' });
        } else {
          syncResults.push({ id: appointment.id, status: 'failed' });
        }
      } catch (error) {
        console.error('Error syncing appointment:', appointment.id, error);
        syncResults.push({ id: appointment.id, status: 'error' });
      }
    }

    const syncedCount = syncResults.filter(r => r.status === 'synced').length;
    console.log(`✅ Synced ${syncedCount}/${appointments.length} appointments`);

    return new Response(JSON.stringify({ 
      synced: syncedCount,
      total: appointments.length,
      results: syncResults 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('❌ Error syncing appointments:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

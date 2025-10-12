import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CalendarEvent {
  title: string;
  description?: string;
  start: string;
  end: string;
  location?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { event } = await req.json() as { event: CalendarEvent };
    
    if (!event || !event.title || !event.start || !event.end) {
      return new Response(
        JSON.stringify({ error: 'Invalid event data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's Google Calendar access token from database
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Extract user ID from JWT
    const token = authHeader.replace('Bearer ', '');
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.sub;

    // Get user's calendar credentials
    const { data: credentials, error: credError } = await supabase
      .from('user_integrations')
      .select('google_calendar_token')
      .eq('user_id', userId)
      .single();

    if (credError || !credentials?.google_calendar_token) {
      return new Response(
        JSON.stringify({ error: 'Google Calendar not connected' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create event in Google Calendar
    const calendarResponse = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credentials.google_calendar_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: event.title,
          description: event.description,
          location: event.location,
          start: {
            dateTime: event.start,
            timeZone: 'America/New_York',
          },
          end: {
            dateTime: event.end,
            timeZone: 'America/New_York',
          },
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 24 * 60 },
              { method: 'popup', minutes: 60 },
            ],
          },
        }),
      }
    );

    if (!calendarResponse.ok) {
      const errorData = await calendarResponse.json();
      console.error('Google Calendar API error:', errorData);
      throw new Error('Failed to create calendar event');
    }

    const calendarEvent = await calendarResponse.json();

    return new Response(
      JSON.stringify({ 
        success: true, 
        eventId: calendarEvent.id,
        htmlLink: calendarEvent.htmlLink 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error syncing to Google Calendar:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

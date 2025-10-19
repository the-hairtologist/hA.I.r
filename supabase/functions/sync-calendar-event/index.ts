import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const { appointment_id, action = "create" } = await req.json();

    if (!appointment_id) {
      throw new Error("Appointment ID required");
    }

    console.log(`[Calendar Sync] ${action} event for appointment:`, appointment_id);

    // Get appointment details with stylist info
    const { data: appointment, error: appointmentError } = await supabaseClient
      .from("appointments")
      .select(`
        *,
        client:client_profiles(full_name, email),
        stylist:stylist_profiles(
          business_name,
          user:profiles(full_name, email),
          user_id
        ),
        service:stylist_services(service_name, duration_minutes)
      `)
      .eq("id", appointment_id)
      .maybeSingle();

    if (appointmentError || !appointment) {
      throw new Error("Appointment not found");
    }

    // Get stylist's calendar connection
    const { data: connection, error: connectionError } = await supabaseClient
      .from("calendar_connections")
      .select("*")
      .eq("user_id", appointment.stylist.user_id)
      .eq("provider", "google")
      .eq("is_active", true)
      .eq("sync_enabled", true)
      .maybeSingle();

    if (connectionError || !connection) {
      console.log("[Calendar Sync] No active calendar connection found");
      return new Response(
        JSON.stringify({ success: false, message: "No calendar connection" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Get tokens from vault
    const { data: tokens, error: tokenError } = await supabaseClient
      .rpc("get_calendar_token", { p_connection_id: connection.id });

    if (tokenError || !tokens || tokens.length === 0) {
      console.error("[Calendar Sync] Failed to retrieve tokens:", tokenError);
      throw new Error("Failed to retrieve calendar tokens");
    }

    const { access_token } = tokens[0];

    if (action === "create" || action === "update") {
      // Create or update calendar event
      const startTime = new Date(appointment.appointment_date);
      const endTime = new Date(startTime.getTime() + (appointment.duration_minutes || 90) * 60000);

      const eventData = {
        summary: `${appointment.service?.service_name || appointment.service_type} - ${appointment.client.full_name}`,
        description: appointment.notes || `Appointment with ${appointment.client.full_name}`,
        start: {
          dateTime: startTime.toISOString(),
          timeZone: "America/New_York",
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: "America/New_York",
        },
        attendees: appointment.client.email ? [{ email: appointment.client.email }] : [],
      };

      // Check if event already exists
      const { data: existingEvent } = await supabaseClient
        .from("appointment_calendar_events")
        .select("external_event_id")
        .eq("appointment_id", appointment_id)
        .eq("calendar_connection_id", connection.id)
        .maybeSingle();

      let calendarResponse;
      let eventId;

      if (existingEvent && action === "update") {
        // Update existing event
        calendarResponse = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${connection.calendar_id}/events/${existingEvent.external_event_id}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(eventData),
          }
        );
        eventId = existingEvent.external_event_id;
      } else {
        // Create new event
        calendarResponse = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${connection.calendar_id}/events`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(eventData),
          }
        );
      }

      if (!calendarResponse.ok) {
        const error = await calendarResponse.text();
        console.error("[Calendar Sync] API error:", error);
        throw new Error(`Calendar API error: ${error}`);
      }

      const calendarEvent = await calendarResponse.json();
      eventId = calendarEvent.id;

      // Save or update sync record
      if (existingEvent) {
        await supabaseClient
          .from("appointment_calendar_events")
          .update({
            sync_status: "synced",
            synced_at: new Date().toISOString(),
            error_message: null,
          })
          .eq("appointment_id", appointment_id)
          .eq("calendar_connection_id", connection.id);
      } else {
        await supabaseClient.from("appointment_calendar_events").insert({
          appointment_id: appointment_id,
          calendar_connection_id: connection.id,
          external_event_id: eventId,
          provider: "google",
          sync_status: "synced",
          synced_at: new Date().toISOString(),
        });
      }

      console.log(`[Calendar Sync] Event ${action}d successfully:`, eventId);
    } else if (action === "delete") {
      // Delete calendar event
      const { data: existingEvent } = await supabaseClient
        .from("appointment_calendar_events")
        .select("external_event_id")
        .eq("appointment_id", appointment_id)
        .eq("calendar_connection_id", connection.id)
        .maybeSingle();

      if (existingEvent) {
        await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${connection.calendar_id}/events/${existingEvent.external_event_id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        );

        await supabaseClient
          .from("appointment_calendar_events")
          .delete()
          .eq("appointment_id", appointment_id)
          .eq("calendar_connection_id", connection.id);

        console.log("[Calendar Sync] Event deleted successfully");
      }
    }

    return new Response(
      JSON.stringify({ success: true, action }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("[Calendar Sync] Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

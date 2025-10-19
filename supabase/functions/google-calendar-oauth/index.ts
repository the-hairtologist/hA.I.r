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
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { code, redirect_uri } = await req.json();
    
    if (!code) {
      throw new Error("Authorization code required");
    }

    const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
    const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");

    console.log("[Google OAuth] Exchanging code for tokens");

    // Exchange authorization code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirect_uri || `${req.headers.get("origin")}/integrations/calendar`,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error("[Google OAuth] Token exchange failed:", error);
      throw new Error(`Token exchange failed: ${error}`);
    }

    const tokens = await tokenResponse.json();
    console.log("[Google OAuth] Tokens received successfully");

    // Store tokens using the security definer function
    const { data: connectionId, error: storeError } = await supabaseClient
      .rpc("store_calendar_token", {
        p_user_id: user.id,
        p_provider: "google",
        p_access_token: tokens.access_token,
        p_refresh_token: tokens.refresh_token,
      });

    if (storeError) {
      console.error("[Google OAuth] Failed to store tokens:", storeError);
      throw storeError;
    }

    // Get calendar list to find primary calendar
    const calendarResponse = await fetch(
      "https://www.googleapis.com/calendar/v3/users/me/calendarList",
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      }
    );

    if (calendarResponse.ok) {
      const calendars = await calendarResponse.json();
      const primaryCalendar = calendars.items?.find((cal: any) => cal.primary);
      
      if (primaryCalendar) {
        // Update connection with calendar ID
        await supabaseClient
          .from("calendar_connections")
          .update({ calendar_id: primaryCalendar.id })
          .eq("id", connectionId);
      }
    }

    console.log("[Google OAuth] Calendar connected successfully");

    return new Response(
      JSON.stringify({ 
        success: true,
        connection_id: connectionId,
        message: "Calendar connected successfully" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("[Google OAuth] Error:", error);
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

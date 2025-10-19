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

  try {
    const { event, data } = await req.json();

    if (!event || !data) {
      throw new Error("Event type and data required");
    }

    console.log("[Zapier] Triggering webhook:", event);

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get active Zapier webhooks for this event
    const { data: webhooks, error: webhookError } = await supabaseClient
      .from("zapier_webhooks")
      .select("*")
      .eq("event_type", event)
      .eq("is_active", true);

    if (webhookError) {
      console.error("[Zapier] Error fetching webhooks:", webhookError);
      throw webhookError;
    }

    if (!webhooks || webhooks.length === 0) {
      console.log("[Zapier] No active webhooks found for event:", event);
      return new Response(
        JSON.stringify({ success: true, message: "No webhooks configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Trigger all webhooks for this event
    const results = await Promise.allSettled(
      webhooks.map(async (webhook) => {
        try {
          const payload = {
            event,
            timestamp: new Date().toISOString(),
            data,
          };

          const response = await fetch(webhook.webhook_url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });

          console.log(`[Zapier] Webhook ${webhook.id} triggered:`, response.status);

          // Update last triggered time
          await supabaseClient
            .from("zapier_webhooks")
            .update({ last_triggered_at: new Date().toISOString() })
            .eq("id", webhook.id);

          return { success: true, webhook_id: webhook.id };
        } catch (error) {
          console.error(`[Zapier] Webhook ${webhook.id} failed:`, error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          return { success: false, webhook_id: webhook.id, error: errorMessage };
        }
      })
    );

    console.log("[Zapier] All webhooks triggered:", results);

    return new Response(
      JSON.stringify({
        success: true,
        triggered: webhooks.length,
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("[Zapier] Error:", error);
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

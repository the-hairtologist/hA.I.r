import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const WEBHOOK_TIMEOUT_MS = 10000; // 10 second timeout
const MAX_RETRIES = 3;

// Helper: Trigger webhook with timeout and retry logic
async function triggerWebhookWithRetry(
  webhook: any,
  payload: any,
  attemptNumber: number = 1
): Promise<{ success: boolean; status?: number; error?: string }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);

  try {
    const response = await fetch(webhook.webhook_url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok && attemptNumber < MAX_RETRIES) {
      console.log(`[Zapier] Webhook ${webhook.id} failed (attempt ${attemptNumber}), retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * attemptNumber)); // Exponential backoff
      return triggerWebhookWithRetry(webhook, payload, attemptNumber + 1);
    }

    return { 
      success: response.ok, 
      status: response.status,
      error: response.ok ? undefined : `HTTP ${response.status}`
    };
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      if (attemptNumber < MAX_RETRIES) {
        console.log(`[Zapier] Webhook ${webhook.id} timeout (attempt ${attemptNumber}), retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attemptNumber));
        return triggerWebhookWithRetry(webhook, payload, attemptNumber + 1);
      }
      return { success: false, error: "Timeout after retries" };
    }
    
    if (attemptNumber < MAX_RETRIES) {
      console.log(`[Zapier] Webhook ${webhook.id} error (attempt ${attemptNumber}), retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * attemptNumber));
      return triggerWebhookWithRetry(webhook, payload, attemptNumber + 1);
    }
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMessage };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { event, data, testMode } = await req.json();

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
        const payload = {
          event,
          timestamp: new Date().toISOString(),
          data,
          test: testMode || false,
        };

        const result = await triggerWebhookWithRetry(webhook, payload);

        // Update webhook stats
        const now = new Date().toISOString();
        const updates: any = {
          last_triggered_at: now,
          total_triggers: (webhook.total_triggers || 0) + 1,
        };

        if (result.success) {
          updates.last_success_at = now;
          updates.last_error_message = null;
        } else {
          updates.last_failure_at = now;
          updates.total_failures = (webhook.total_failures || 0) + 1;
          updates.last_error_message = result.error;
        }

        await supabaseClient
          .from("zapier_webhooks")
          .update(updates)
          .eq("id", webhook.id);

        // Log delivery
        await supabaseClient
          .from("zapier_delivery_log")
          .insert({
            webhook_id: webhook.id,
            event_type: event,
            payload,
            status: result.success ? 'success' : 'failed',
            http_status: result.status,
            error_message: result.error,
            attempt_number: result.success ? 1 : MAX_RETRIES,
          });

        console.log(`[Zapier] Webhook ${webhook.id} ${result.success ? '✅ succeeded' : '❌ failed'}:`, result.status || result.error);

        return { 
          success: result.success, 
          webhook_id: webhook.id,
          status: result.status,
          error: result.error 
        };
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

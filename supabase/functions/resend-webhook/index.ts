import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature",
};

// Verify Resend webhook signature
async function verifyWebhookSignature(req: Request): Promise<boolean> {
  const RESEND_WEBHOOK_SECRET = Deno.env.get("RESEND_WEBHOOK_SECRET");
  
  // If no secret configured, log warning but allow (for initial setup)
  if (!RESEND_WEBHOOK_SECRET) {
    console.warn("⚠️ RESEND_WEBHOOK_SECRET not configured - webhook signatures not verified");
    return true;
  }

  const signature = req.headers.get("svix-signature");
  const timestamp = req.headers.get("svix-timestamp");
  const id = req.headers.get("svix-id");

  if (!signature || !timestamp || !id) {
    console.error("❌ Missing Resend webhook headers");
    return false;
  }

  // Resend uses Svix for webhooks - signature format: v1,signature
  const body = await req.text();
  const signedContent = `${id}.${timestamp}.${body}`;
  
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(RESEND_WEBHOOK_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const signatureParts = signature.split(",");
    for (const part of signatureParts) {
      const [version, sig] = part.split("=");
      if (version === "v1") {
        const expectedSig = encoder.encode(sig);
        const isValid = await crypto.subtle.verify(
          "HMAC",
          key,
          expectedSig,
          encoder.encode(signedContent)
        );
        if (isValid) return true;
      }
    }
    return false;
  } catch (error) {
    console.error("❌ Signature verification error:", error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify webhook signature
    const isValid = await verifyWebhookSignature(req);
    if (!isValid) {
      console.error("❌ Invalid webhook signature");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload = await req.json();
    console.log("📨 Resend webhook received (verified):", payload.type);

    const { type, data } = payload;

    // Find log entry by resend_email_id
    if (!data?.email_id) {
      console.log("⚠️ No email_id in webhook payload");
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle different webhook events
    switch (type) {
      case "email.opened":
        await supabase
          .from("email_sequence_logs")
          .update({ opened_at: new Date().toISOString() })
          .eq("resend_email_id", data.email_id);
        console.log(`✅ Marked email ${data.email_id} as opened`);
        break;

      case "email.clicked":
        await supabase
          .from("email_sequence_logs")
          .update({ clicked_at: new Date().toISOString() })
          .eq("resend_email_id", data.email_id);
        console.log(`✅ Marked email ${data.email_id} as clicked`);
        break;

      case "email.bounced":
        await supabase
          .from("email_sequence_logs")
          .update({
            bounced: true,
            bounce_reason: data.bounce?.message || "Unknown",
          })
          .eq("resend_email_id", data.email_id);
        console.log(`⚠️ Email ${data.email_id} bounced`);
        break;

      case "email.complained":
        // Mark as unsubscribed
        await supabase
          .from("email_sequence_logs")
          .update({ unsubscribed: true })
          .eq("resend_email_id", data.email_id);

        // Update email preferences
        await supabase
          .from("email_preferences")
          .update({
            marketing_emails_enabled: false,
            appointment_reminders_enabled: false,
          })
          .eq("email", data.to);

        console.log(`🚫 Email ${data.email_id} marked as spam - unsubscribed`);
        break;

      default:
        console.log(`ℹ️ Unhandled webhook type: ${type}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

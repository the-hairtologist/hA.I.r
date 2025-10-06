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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get appointments for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const { data: appointments, error } = await supabase
      .from("appointments")
      .select(`
        *,
        client:client_profiles(full_name, phone, email),
        stylist:stylist_profiles(business_name, user_id)
      `)
      .eq("status", "scheduled")
      .gte("appointment_date", tomorrow.toISOString())
      .lt("appointment_date", dayAfter.toISOString())
      .eq("reminder_sent", false);

    if (error) throw error;

    console.log(`Found ${appointments?.length || 0} appointments for reminders`);

    for (const apt of appointments || []) {
      try {
        // Get last formula used for this client
        const { data: lastFormula } = await supabase
          .from("formulas")
          .select("formula_text, color_line, result_notes")
          .eq("client_id", apt.client_id)
          .eq("stylist_id", apt.stylist_id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        // Create personalized reminder message
        const clientName = apt.client?.full_name?.split(" ")[0] || "there";
        const stylistName = apt.stylist?.business_name || "your stylist";
        const time = new Date(apt.appointment_date).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });

        let message = `Hi ${clientName}! ✨ ${stylistName} is ready for your ${apt.service_type} tomorrow at ${time}!`;

        // Add formula context if available
        if (lastFormula) {
          message += `\n\n💡 Last time we used: ${lastFormula.color_line || "custom formula"}`;
          if (lastFormula.result_notes) {
            message += ` - ${lastFormula.result_notes}`;
          }
        }

        message += `\n\nSee you soon! 💇‍♀️`;

        // Send SMS reminder if phone number exists
        if (apt.client?.phone) {
          await supabase.functions.invoke("send-sms-notification", {
            body: {
              to: apt.client.phone,
              message: message,
            },
          });
        }

        // Send email reminder
        if (apt.client?.email) {
          await supabase.functions.invoke("send-appointment-reminder", {
            body: {
              appointmentId: apt.id,
              customMessage: message,
            },
          });
        }

        // Mark as sent
        await supabase
          .from("appointments")
          .update({ reminder_sent: true })
          .eq("id", apt.id);

        console.log(`✅ Reminder sent for appointment ${apt.id}`);
      } catch (aptError) {
        console.error(`Error processing appointment ${apt.id}:`, aptError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: appointments?.length || 0,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in smart-reminder:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

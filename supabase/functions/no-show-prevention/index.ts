import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'hA.I.r <onboarding@resend.dev>';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * No-Show Prevention Service
 * 
 * Runs twice daily to send appointment confirmation requests:
 * - 48 hours before appointment
 * - 24 hours before appointment (if not confirmed)
 * 
 * This reduces no-shows by prompting clients to confirm attendance
 */

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🔔 Starting no-show prevention service");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let totalSent = 0;
    const now = new Date();

    // 1. SEND 48-HOUR CONFIRMATION REQUESTS
    const fortyEightHoursFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const fortyNineHoursFromNow = new Date(now.getTime() + 49 * 60 * 60 * 1000);

    const { data: appointments48h } = await supabase
      .from("appointments")
      .select(`
        *,
        client:client_profiles(
          id,
          user:profiles(email, full_name)
        ),
        stylist:stylist_profiles(
          user:profiles(full_name),
          business_name
        )
      `)
      .in("status", ["scheduled", "confirmed"])
      .gte("appointment_date", fortyEightHoursFromNow.toISOString())
      .lt("appointment_date", fortyNineHoursFromNow.toISOString())
      .eq("confirmation_requested_48h", false);

    console.log(`📋 Found ${appointments48h?.length || 0} appointments needing 48h confirmation`);

    for (const appointment of appointments48h || []) {
      const clientEmail = appointment.client?.user?.email;
      const clientName = appointment.client?.user?.full_name || "Client";
      const stylistName = appointment.stylist?.user?.full_name || appointment.stylist?.business_name;
      const clientId = appointment.client?.id;

      if (!clientEmail || !clientId) continue;

      // Check email preferences
      const { data: prefs } = await supabase
        .from("email_preferences")
        .select("appointment_reminders_enabled")
        .eq("client_id", clientId)
        .maybeSingle();

      if (prefs && !prefs.appointment_reminders_enabled) {
        console.log(`⏭️ Skipping 48h confirmation - user opted out: ${clientEmail}`);
        continue;
      }

      const appointmentDate = new Date(appointment.appointment_date).toLocaleString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });

      const confirmUrl = `${Deno.env.get("SUPABASE_URL")}/confirm-appointment/${appointment.id}`;

      const emailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #9333ea, #ec4899); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
              .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px; }
              .button { display: inline-block; background: linear-gradient(135deg, #9333ea, #ec4899); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; }
              .appointment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #9333ea; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>⏰ Confirm Your Appointment</h1>
              </div>
              <div class="content">
                <p>Hi ${clientName}!</p>
                <p>Your appointment with <strong>${stylistName}</strong> is coming up in 48 hours.</p>
                
                <div class="appointment-details">
                  <strong>📅 ${appointmentDate}</strong><br>
                  <strong>💇 ${appointment.service_type}</strong>
                </div>

                <p>Please confirm that you'll be able to make it:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${confirmUrl}" class="button">
                    ✅ Yes, I'll be there!
                  </a>
                </div>

                <p style="font-size: 14px; color: #6c757d; margin-top: 30px;">
                  Need to reschedule? Reply to this email or contact ${stylistName} directly.
                </p>
              </div>
            </div>
          </body>
        </html>
      `;

      await resend.emails.send({
        from: FROM_EMAIL,
        to: [clientEmail],
        subject: `⏰ Confirm your appointment (48 hours)`,
        html: emailHtml,
      });

      await supabase
        .from("appointments")
        .update({ confirmation_requested_48h: true })
        .eq("id", appointment.id);

      totalSent++;
      console.log(`✅ Sent 48h confirmation for appointment ${appointment.id}`);
    }

    // 2. SEND 24-HOUR FINAL CONFIRMATION REQUESTS (for unconfirmed appointments)
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const twentyFiveHoursFromNow = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    const { data: appointments24h } = await supabase
      .from("appointments")
      .select(`
        *,
        client:client_profiles(
          id,
          user:profiles(email, full_name)
        ),
        stylist:stylist_profiles(
          user:profiles(full_name),
          business_name,
          phone
        )
      `)
      .in("status", ["scheduled", "confirmed"])
      .gte("appointment_date", twentyFourHoursFromNow.toISOString())
      .lt("appointment_date", twentyFiveHoursFromNow.toISOString())
      .eq("confirmation_requested_24h", false)
      .eq("confirmed_by_client", false);

    console.log(`📋 Found ${appointments24h?.length || 0} unconfirmed appointments needing 24h reminder`);

    for (const appointment of appointments24h || []) {
      const clientEmail = appointment.client?.user?.email;
      const clientName = appointment.client?.user?.full_name || "Client";
      const stylistName = appointment.stylist?.user?.full_name || appointment.stylist?.business_name;
      const stylistPhone = appointment.stylist?.phone;
      const clientId = appointment.client?.id;

      if (!clientEmail || !clientId) continue;

      // Check email preferences
      const { data: prefs } = await supabase
        .from("email_preferences")
        .select("appointment_reminders_enabled")
        .eq("client_id", clientId)
        .maybeSingle();

      if (prefs && !prefs.appointment_reminders_enabled) {
        console.log(`⏭️ Skipping 24h confirmation - user opted out: ${clientEmail}`);
        continue;
      }

      const appointmentDate = new Date(appointment.appointment_date).toLocaleString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });

      const confirmUrl = `${Deno.env.get("SUPABASE_URL")}/confirm-appointment/${appointment.id}`;

      const emailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #dc2626, #ea580c); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
              .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px; }
              .button { display: inline-block; background: linear-gradient(135deg, #dc2626, #ea580c); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; }
              .appointment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626; }
              .urgent { background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border: 2px solid #dc2626; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🚨 Final Confirmation Needed</h1>
              </div>
              <div class="content">
                <div class="urgent">
                  <strong>⚠️ URGENT:</strong> Your appointment is in 24 hours!
                </div>

                <p>Hi ${clientName},</p>
                <p>We haven't received your confirmation yet. Your appointment with <strong>${stylistName}</strong> is tomorrow:</p>
                
                <div class="appointment-details">
                  <strong>📅 ${appointmentDate}</strong><br>
                  <strong>💇 ${appointment.service_type}</strong>
                </div>

                <p><strong>Please confirm now to keep your spot:</strong></p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${confirmUrl}" class="button">
                    ✅ Confirm Appointment
                  </a>
                </div>

                <p style="font-size: 14px; color: #6c757d; margin-top: 30px;">
                  ${stylistPhone ? `Can't make it? Call/text ${stylistName} at ${stylistPhone}` : `Can't make it? Reply to this email to reschedule.`}
                </p>
              </div>
            </div>
          </body>
        </html>
      `;

      await resend.emails.send({
        from: FROM_EMAIL,
        to: [clientEmail],
        subject: `🚨 URGENT: Confirm appointment tomorrow`,
        html: emailHtml,
      });

      await supabase
        .from("appointments")
        .update({ confirmation_requested_24h: true })
        .eq("id", appointment.id);

      totalSent++;
      console.log(`✅ Sent 24h final confirmation for appointment ${appointment.id}`);
    }

    console.log(`📧 Successfully sent ${totalSent} confirmation requests`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        totalSent,
        confirmations48h: appointments48h?.length || 0,
        confirmations24h: appointments24h?.length || 0
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("❌ Error in no-show-prevention:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

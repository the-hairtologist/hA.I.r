import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Automated Appointment Follow-up Service
 * 
 * Runs on a schedule (via cron) to:
 * 1. Send post-appointment follow-ups requesting reviews
 * 2. Check for no-shows and send re-booking reminders
 * 3. Send birthday/anniversary messages to clients
 * 
 * Schedule this to run daily via pg_cron
 */

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🤖 Starting automated appointment follow-up service");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let totalSent = 0;

    // 1. POST-APPOINTMENT REVIEW REQUESTS (24 hours after completed appointment)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const { data: completedAppointments } = await supabase
      .from("appointments")
      .select(`
        *,
        client:client_profiles(
          user:profiles(email, full_name)
        ),
        stylist:stylist_profiles(
          user:profiles(full_name),
          business_name
        )
      `)
      .eq("status", "completed")
      .gte("appointment_date", twoDaysAgo.toISOString())
      .lt("appointment_date", yesterday.toISOString())
      .is("followup_sent", false);

    console.log(`📋 Found ${completedAppointments?.length || 0} appointments for follow-up`);

    for (const appointment of completedAppointments || []) {
      const clientEmail = appointment.client?.user?.email;
      const clientName = appointment.client?.user?.full_name || "Client";
      const stylistName = appointment.stylist?.user?.full_name || appointment.stylist?.business_name;

      if (!clientEmail) continue;

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
              .stars { font-size: 32px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✨ How was your experience?</h1>
              </div>
              <div class="content">
                <p>Hi ${clientName}!</p>
                <p>Thank you for choosing <strong>${stylistName}</strong> for your recent ${appointment.service_type} appointment.</p>
                <p>We'd love to hear about your experience! Your feedback helps us continue providing excellent service.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://your-app.com/review/${appointment.id}" class="button">
                    Leave a Review ⭐
                  </a>
                </div>

                <p style="font-size: 14px; color: #6c757d; margin-top: 30px;">
                  Want to book your next appointment? Reply to this email or log in to your dashboard.
                </p>
              </div>
            </div>
          </body>
        </html>
      `;

      await resend.emails.send({
        from: "hA.I.r <onboarding@resend.dev>",
        to: [clientEmail],
        subject: "✨ How was your appointment?",
        html: emailHtml,
      });

      await supabase
        .from("appointments")
        .update({ followup_sent: true })
        .eq("id", appointment.id);

      totalSent++;
      console.log(`✅ Sent follow-up for appointment ${appointment.id}`);
    }

    // 2. NO-SHOW RE-BOOKING REMINDERS (3 days after no-show)
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const fourDaysAgo = new Date();
    fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

    const { data: noShowAppointments } = await supabase
      .from("appointments")
      .select(`
        *,
        client:client_profiles(
          user:profiles(email, full_name)
        ),
        stylist:stylist_profiles(
          user:profiles(full_name),
          business_name
        )
      `)
      .eq("status", "no_show")
      .gte("appointment_date", fourDaysAgo.toISOString())
      .lt("appointment_date", threeDaysAgo.toISOString())
      .is("rebook_reminder_sent", false);

    console.log(`📋 Found ${noShowAppointments?.length || 0} no-shows for re-booking reminder`);

    for (const appointment of noShowAppointments || []) {
      const clientEmail = appointment.client?.user?.email;
      const clientName = appointment.client?.user?.full_name || "Client";
      const stylistName = appointment.stylist?.user?.full_name || appointment.stylist?.business_name;

      if (!clientEmail) continue;

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
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>💇 We missed you!</h1>
              </div>
              <div class="content">
                <p>Hi ${clientName},</p>
                <p>We noticed you weren't able to make your recent appointment with <strong>${stylistName}</strong>.</p>
                <p>Life happens! We'd love to reschedule and take care of your hair needs. 💕</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://your-app.com/book" class="button">
                    Book Your Next Visit
                  </a>
                </div>

                <p style="font-size: 14px; color: #6c757d; margin-top: 30px;">
                  Questions? Reply to this email or contact ${stylistName} directly.
                </p>
              </div>
            </div>
          </body>
        </html>
      `;

      await resend.emails.send({
        from: "hA.I.r <onboarding@resend.dev>",
        to: [clientEmail],
        subject: "💕 We'd love to see you again!",
        html: emailHtml,
      });

      await supabase
        .from("appointments")
        .update({ rebook_reminder_sent: true })
        .eq("id", appointment.id);

      totalSent++;
      console.log(`✅ Sent re-booking reminder for appointment ${appointment.id}`);
    }

    console.log(`📧 Successfully sent ${totalSent} automated follow-ups`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        totalSent,
        completedFollowups: completedAppointments?.length || 0,
        noShowReminders: noShowAppointments?.length || 0
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
    console.error("❌ Error in automated-appointment-followup:", error);
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

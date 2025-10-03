import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Checking for appointments needing reminders...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get appointments happening in the next 24-26 hours
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const dayAfter = new Date(now.getTime() + 26 * 60 * 60 * 1000);

    const { data: appointments, error: appointmentsError } = await supabase
      .from("appointments")
      .select(`
        *,
        stylist:stylist_profiles(
          user:profiles(full_name, email),
          business_name,
          location
        ),
        client:client_profiles(
          user:profiles(full_name, email)
        ),
        service:stylist_services(service_name, price, duration_minutes)
      `)
      .gte("appointment_date", tomorrow.toISOString())
      .lte("appointment_date", dayAfter.toISOString())
      .eq("status", "scheduled");

    if (appointmentsError) {
      console.error("Error fetching appointments:", appointmentsError);
      throw appointmentsError;
    }

    console.log(`Found ${appointments?.length || 0} appointments to remind`);

    if (!appointments || appointments.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No reminders to send" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Send reminder emails
    const emailPromises = appointments.map(async (appointment) => {
      const appointmentDate = new Date(appointment.appointment_date);
      const formattedDate = appointmentDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const formattedTime = appointmentDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      const stylistName = appointment.stylist.user.full_name || appointment.stylist.business_name;
      const clientName = appointment.client.user.full_name;
      const clientEmail = appointment.client.user.email;
      const serviceName = appointment.service?.service_name || appointment.service_type;
      const serviceDuration = appointment.service?.duration_minutes || appointment.duration_minutes;

      const emailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #fbbf24, #f59e0b); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
              .header h1 { margin: 0; font-size: 28px; }
              .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px; }
              .reminder-card { background: white; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
              .detail-row { margin: 12px 0; padding: 8px 0; border-bottom: 1px solid #e9ecef; }
              .detail-label { font-weight: 600; color: #f59e0b; display: inline-block; width: 120px; }
              .detail-value { color: #495057; }
              .highlight { background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0; }
              .footer { text-align: center; color: #6c757d; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; }
              .emoji { font-size: 24px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="emoji">⏰💇‍♀️</div>
                <h1>Appointment Reminder</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Your appointment is tomorrow!</p>
              </div>
              
              <div class="content">
                <p>Hi ${clientName},</p>
                <p>This is a friendly reminder about your upcoming appointment with <strong>${stylistName}</strong>.</p>
                
                <div class="reminder-card">
                  <div class="detail-row">
                    <span class="detail-label">📅 Date:</span>
                    <span class="detail-value">${formattedDate}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">🕐 Time:</span>
                    <span class="detail-value">${formattedTime}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">💇 Service:</span>
                    <span class="detail-value">${serviceName}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">⏱️ Duration:</span>
                    <span class="detail-value">${serviceDuration} minutes</span>
                  </div>
                  ${appointment.stylist.location ? `
                  <div class="detail-row">
                    <span class="detail-label">📍 Location:</span>
                    <span class="detail-value">${appointment.stylist.location}</span>
                  </div>
                  ` : ''}
                </div>

                <div class="highlight">
                  <strong>💡 Quick Reminders:</strong>
                  <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                    <li>Please arrive 5 minutes early</li>
                    <li>Bring any hair inspiration photos</li>
                    <li>Contact your stylist if you need to reschedule</li>
                  </ul>
                </div>

                <p style="margin-top: 25px;">Looking forward to seeing you!</p>

                <div class="footer">
                  <p><strong>hA.I.r</strong> - AI-Powered Salon Assistant</p>
                  <p style="font-size: 12px; color: #868e96;">This is an automated reminder email.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      return resend.emails.send({
        from: "hA.I.r <onboarding@resend.dev>",
        to: [clientEmail],
        subject: `⏰ Reminder: Appointment Tomorrow at ${formattedTime}`,
        html: emailHtml,
      });
    });

    const results = await Promise.allSettled(emailPromises);
    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    console.log(`Sent ${successful} reminders, ${failed} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sent ${successful} reminders`,
        stats: { successful, failed, total: appointments.length },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-appointment-reminder function:", error);
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

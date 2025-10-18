import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const requestSchema = z.object({
  appointmentId: z.string().uuid()
});

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Validate input
    const validationResult = requestSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input: appointmentId must be a valid UUID',
          details: validationResult.error.format()
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { appointmentId } = validationResult.data;
    console.log("Processing confirmation for appointment:", appointmentId);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get appointment details with related data
    const { data: appointment, error: appointmentError } = await supabase
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
      .eq("id", appointmentId)
      .single();

    if (appointmentError || !appointment) {
      console.error("Error fetching appointment:", appointmentError);
      throw new Error("Appointment not found");
    }

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
    const servicePrice = appointment.service?.price || 0;
    const serviceDuration = appointment.service?.duration_minutes || appointment.duration_minutes;

    // Send confirmation email to client
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #9333ea, #ec4899); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px; }
            .appointment-card { background: white; border-left: 4px solid #9333ea; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .detail-row { margin: 12px 0; padding: 8px 0; border-bottom: 1px solid #e9ecef; }
            .detail-label { font-weight: 600; color: #9333ea; display: inline-block; width: 120px; }
            .detail-value { color: #495057; }
            .button { display: inline-block; background: linear-gradient(135deg, #9333ea, #ec4899); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; }
            .footer { text-align: center; color: #6c757d; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; }
            .emoji { font-size: 24px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="emoji">✨💇‍♀️</div>
              <h1>Appointment Confirmed!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">You're all set, ${clientName}!</p>
            </div>
            
            <div class="content">
              <p>Great news! Your appointment has been confirmed with <strong>${stylistName}</strong>.</p>
              
              <div class="appointment-card">
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
                <div class="detail-row">
                  <span class="detail-label">💵 Price:</span>
                  <span class="detail-value">$${servicePrice}</span>
                </div>
                ${appointment.stylist.location ? `
                <div class="detail-row">
                  <span class="detail-label">📍 Location:</span>
                  <span class="detail-value">${appointment.stylist.location}</span>
                </div>
                ` : ''}
              </div>

              ${appointment.notes ? `
              <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <strong>📝 Your Notes:</strong>
                <p style="margin: 8px 0 0 0;">${appointment.notes}</p>
              </div>
              ` : ''}

              <p style="margin-top: 25px;"><strong>What to expect:</strong></p>
              <ul style="color: #495057;">
                <li>You'll receive a reminder email 24 hours before your appointment</li>
                <li>Please arrive 5 minutes early</li>
                <li>Contact your stylist if you need to reschedule</li>
              </ul>

              <div class="footer">
                <p><strong>hA.I.r</strong> - AI-Powered Salon Assistant</p>
                <p style="font-size: 12px; color: #868e96;">This is an automated confirmation email. Please do not reply.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const { error: emailError } = await resend.emails.send({
      from: "hA.I.r <onboarding@resend.dev>",
      to: [clientEmail],
      subject: `✨ Appointment Confirmed - ${formattedDate} at ${formattedTime}`,
      html: emailHtml,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      throw emailError;
    }

    console.log("Confirmation email sent successfully to:", clientEmail);

    return new Response(
      JSON.stringify({ success: true, message: "Confirmation email sent" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-appointment-confirmation function:", error);
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

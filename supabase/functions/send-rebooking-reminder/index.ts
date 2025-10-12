import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RebookingReminderData {
  clientName: string;
  clientEmail: string;
  stylistName: string;
  lastAppointmentDate: string;
  bookingUrl: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    console.log("Checking for appointments needing rebooking reminders...");

    // Find completed appointments from 6 weeks ago that haven't received reminders
    const sixWeeksAgo = new Date();
    sixWeeksAgo.setDate(sixWeeksAgo.getDate() - 42);
    
    const sevenWeeksAgo = new Date();
    sevenWeeksAgo.setDate(sevenWeeksAgo.getDate() - 49);

    const { data: appointments, error: appointmentsError } = await supabase
      .from("appointments")
      .select(`
        id,
        appointment_date,
        client_id,
        stylist_id,
        client_profiles!appointments_client_id_fkey (
          id,
          full_name,
          email,
          user_id,
          profiles!client_profiles_user_id_fkey (
            email
          )
        ),
        stylist_profiles!appointments_stylist_id_fkey (
          id,
          profiles!stylist_profiles_user_id_fkey (
            full_name
          )
        )
      `)
      .eq("status", "completed")
      .gte("appointment_date", sevenWeeksAgo.toISOString())
      .lte("appointment_date", sixWeeksAgo.toISOString());

    if (appointmentsError) {
      console.error("Error fetching appointments:", appointmentsError);
      throw appointmentsError;
    }

    console.log(`Found ${appointments?.length || 0} appointments to check`);

    let remindersSent = 0;
    const errors: any[] = [];

    for (const appointment of appointments || []) {
      try {
        // Check if reminder already sent
        const { data: existingReminder } = await supabase
          .from("rebooking_reminders")
          .select("id")
          .eq("appointment_id", appointment.id)
          .eq("reminder_type", "six_week")
          .single();

        if (existingReminder) {
          console.log(`Reminder already sent for appointment ${appointment.id}`);
          continue;
        }

        const clientProfile = appointment.client_profiles as any;
        const stylistProfile = appointment.stylist_profiles as any;
        
        const clientEmail = clientProfile?.email || clientProfile?.profiles?.email;
        const clientName = clientProfile?.full_name || "Valued Client";
        const stylistName = stylistProfile?.profiles?.full_name || "Your Stylist";

        if (!clientEmail) {
          console.log(`No email found for appointment ${appointment.id}`);
          continue;
        }

        // Create booking URL
        const bookingUrl = `${Deno.env.get("SUPABASE_URL")?.replace("supabase.co", "lovableproject.com") || "https://app.example.com"}/appointments`;

        // Send email reminder
        const emailResult = await resend.emails.send({
          from: "hA.I.r <onboarding@resend.dev>",
          to: [clientEmail],
          subject: `Time for a Touch-Up with ${stylistName}! 💇`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #6366f1;">Hi ${clientName}! ✨</h1>
              
              <p style="font-size: 16px; line-height: 1.6;">
                It's been about 6 weeks since your last amazing appointment with ${stylistName}!
              </p>
              
              <p style="font-size: 16px; line-height: 1.6;">
                Your hair is probably ready for some love. Want to book another session?
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${bookingUrl}" style="background-color: #6366f1; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                  Book Your Appointment
                </a>
              </div>
              
              <p style="font-size: 14px; color: #666; line-height: 1.6;">
                ${stylistName} is excited to see you again and help you maintain that fabulous look!
              </p>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
              
              <p style="font-size: 12px; color: #999;">
                You're receiving this because you had an appointment on ${new Date(appointment.appointment_date).toLocaleDateString()}.
                <br>If you've already rebooked, please disregard this reminder.
              </p>
            </div>
          `,
        });

        console.log(`Email sent to ${clientEmail}:`, emailResult);

        // Log reminder in database
        const { error: insertError } = await supabase
          .from("rebooking_reminders")
          .insert({
            appointment_id: appointment.id,
            client_id: appointment.client_id,
            stylist_id: appointment.stylist_id,
            reminder_type: "six_week",
            status: "sent",
          });

        if (insertError) {
          console.error("Error logging reminder:", insertError);
          errors.push({ appointment: appointment.id, error: insertError });
        } else {
          remindersSent++;
        }
      } catch (error) {
        console.error(`Error processing appointment ${appointment.id}:`, error);
        errors.push({ appointment: appointment.id, error });
      }
    }

    console.log(`Successfully sent ${remindersSent} reminders`);

    return new Response(
      JSON.stringify({
        success: true,
        remindersSent,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-rebooking-reminder function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

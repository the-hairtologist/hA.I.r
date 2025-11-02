import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'https://esm.sh/resend@2.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};
const FROM_EMAIL =
  Deno.env.get('FROM_EMAIL') || 'hA.I.r <onboarding@resend.dev>';

interface RebookingReminderData {
  clientName: string;
  clientEmail: string;
  stylistName: string;
  lastAppointmentDate: string;
  bookingUrl: string;
}

serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    console.log('Checking for appointments needing rebooking reminders...');

    // Find completed appointments from 6 weeks ago that haven't received reminders
    const sixWeeksAgo = new Date();
    sixWeeksAgo.setDate(sixWeeksAgo.getDate() - 42);

    const sevenWeeksAgo = new Date();
    sevenWeeksAgo.setDate(sevenWeeksAgo.getDate() - 49);

    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select(
        `
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
          business_name,
          profiles!stylist_profiles_user_id_fkey (
            full_name
          )
        )
      `
      )
      .eq('status', 'completed')
      .gte('appointment_date', sevenWeeksAgo.toISOString())
      .lte('appointment_date', sixWeeksAgo.toISOString());

    if (appointmentsError) {
      console.error('Error fetching appointments:', appointmentsError);
      throw appointmentsError;
    }

    console.log(`Found ${appointments?.length || 0} appointments to check`);

    let remindersSent = 0;
    const errors: any[] = [];

    for (const appointment of appointments || []) {
      try {
        // Check if reminder already sent
        const { data: existingReminder } = await supabase
          .from('rebooking_reminders')
          .select('id')
          .eq('appointment_id', appointment.id)
          .eq('reminder_type', 'six_week')
          .single();

        if (existingReminder) {
          console.log(
            `Reminder already sent for appointment ${appointment.id}`
          );
          continue;
        }

        const clientProfile = appointment.client_profiles as any;
        const stylistProfile = appointment.stylist_profiles as any;

        const clientEmail =
          clientProfile?.email || clientProfile?.profiles?.email;
        const clientName = clientProfile?.full_name || 'Valued Client';
        const stylistName =
          stylistProfile?.profiles?.full_name || 'Your Stylist';
        const businessName = stylistProfile?.business_name || stylistName;

        if (!clientEmail) {
          console.log(`No email found for appointment ${appointment.id}`);
          continue;
        }

        // Get stylist's email settings for customization
        const { data: emailSettings } = await supabase
          .from('email_settings')
          .select('*')
          .eq('user_id', stylistProfile?.user_id)
          .single();

        // Use custom settings or defaults
        const settings = emailSettings || {
          rebooking_enabled: true,
          rebooking_subject: '✨ Time for a Touch-Up with {{stylist_name}}!',
          rebooking_headline: 'Hi {{client_name}}! 👋',
          rebooking_opening:
            "It's been about 6 weeks since your last visit with {{stylist_name}} at {{business_name}}. Your hair is probably ready for some professional love! 💇",
          rebooking_cta_text: '📅 Book Your Appointment',
          rebooking_closing:
            '{{stylist_name}} is looking forward to seeing you again and help you maintain that fabulous look!',
          custom_message: '',
          show_business_logo: false,
          business_logo_url: '',
        };

        // Skip if stylist has disabled rebooking emails
        if (!settings.rebooking_enabled) {
          console.log(
            `Rebooking emails disabled for stylist ${stylistProfile?.id}`
          );
          continue;
        }

        // Function to replace placeholders
        const replacePlaceholders = (text: string) => {
          if (!text) return '';
          return text
            .replace(/\{\{client_name\}\}/g, clientName)
            .replace(/\{\{stylist_name\}\}/g, stylistName)
            .replace(/\{\{business_name\}\}/g, businessName);
        };

        // Check email preferences
        const { data: emailPrefs } = await supabase
          .from('email_preferences')
          .select('rebooking_reminders_enabled, unsubscribe_token')
          .eq('client_id', appointment.client_id)
          .single();

        // Create email preferences if they don't exist
        let unsubscribeToken = emailPrefs?.unsubscribe_token;
        if (!emailPrefs) {
          const { data: newPrefs } = await supabase
            .from('email_preferences')
            .insert({
              client_id: appointment.client_id,
              email: clientEmail,
            })
            .select('unsubscribe_token')
            .single();
          unsubscribeToken = newPrefs?.unsubscribe_token;
        }

        // Skip if user has unsubscribed from rebooking reminders
        if (emailPrefs && !emailPrefs.rebooking_reminders_enabled) {
          console.log(
            `Client ${clientEmail} has unsubscribed from rebooking reminders`
          );
          continue;
        }

        // Create booking URL with tracking
        const baseUrl =
          Deno.env
            .get('SUPABASE_URL')
            ?.replace('supabase.co', 'lovableproject.com') ||
          'https://app.example.com';
        const bookingUrl = `${baseUrl}/appointments?ref=rebooking_email&reminder_id=${appointment.id}`;
        const unsubscribeUrl = `${baseUrl}/unsubscribe?token=${unsubscribeToken}`;

        // Build custom email HTML using stylist's settings
        const logoSection =
          settings.show_business_logo && settings.business_logo_url
            ? `
          <tr>
            <td style="padding: 20px; text-align: center; border-bottom: 1px solid #e5e7eb;">
              <img src="${settings.business_logo_url}" alt="${businessName} Logo" style="max-width: 150px; height: auto;">
            </td>
          </tr>
        `
            : '';

        const customMessageSection = settings.custom_message
          ? `
          <div style="background-color: #f8f9fa; border-left: 4px solid #6366f1; padding: 20px; margin: 30px 0; border-radius: 8px;">
            <p style="font-size: 15px; line-height: 1.6; color: #333; margin: 0;">
              ${replacePlaceholders(settings.custom_message)}
            </p>
          </div>
        `
          : '';

        // Send email reminder with stylist's customization
        const emailResult = await resend.emails.send({
          from: FROM_EMAIL,
          to: [clientEmail],
          subject: replacePlaceholders(settings.rebooking_subject),
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">
                      ${logoSection}
                      
                      <!-- Header with gradient -->
                      <tr>
                        <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 40px 30px; text-align: center;">
                          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">
                            ${replacePlaceholders(settings.rebooking_headline)}
                          </h1>
                        </td>
                      </tr>
                      
                      <!-- Main content -->
                      <tr>
                        <td style="padding: 40px;">
                          <p style="font-size: 16px; line-height: 1.6; color: #555; margin: 0 0 20px;">
                            ${replacePlaceholders(settings.rebooking_opening)}
                          </p>
                          
                          ${customMessageSection}
                          
                          <!-- CTA Button -->
                          <div style="text-align: center; margin: 40px 0;">
                            <a href="${bookingUrl}" style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(99,102,241,0.3);">
                              ${replacePlaceholders(settings.rebooking_cta_text)}
                            </a>
                          </div>
                          
                          <!-- Pro Tip -->
                          <div style="background-color: #f8f9fa; border-left: 4px solid #6366f1; padding: 20px; margin: 30px 0; border-radius: 8px;">
                            <p style="font-size: 14px; line-height: 1.6; color: #666; margin: 0;">
                              💡 <strong>Pro Tip:</strong> Regular appointments every 6-8 weeks help maintain healthy, beautiful hair. ${replacePlaceholders(settings.rebooking_closing)}
                            </p>
                          </div>
                          
                          <p style="font-size: 14px; line-height: 1.6; color: #888; margin: 30px 0 0; text-align: center;">
                            Have questions? Just reply to this email!
                          </p>
                        </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                        <td style="background-color: #f8f9fa; padding: 30px 40px; border-top: 1px solid #e5e7eb;">
                          <p style="font-size: 12px; color: #999; line-height: 1.5; margin: 0 0 10px; text-align: center;">
                            You're receiving this because you had an appointment on <strong>${new Date(appointment.appointment_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>.
                            <br>Already rebooked? Great! You can ignore this reminder.
                          </p>
                          
                          <p style="font-size: 11px; color: #aaa; line-height: 1.5; margin: 15px 0 0; text-align: center;">
                            <a href="${unsubscribeUrl}" style="color: #6366f1; text-decoration: none;">Unsubscribe from rebooking reminders</a>
                            <br>
                            Powered by hA.I.r - Smart scheduling for stylists
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `,
        });

        console.log(`Email sent to ${clientEmail}:`, emailResult);

        // Log reminder in database
        const { error: insertError } = await supabase
          .from('rebooking_reminders')
          .insert({
            appointment_id: appointment.id,
            client_id: appointment.client_id,
            stylist_id: appointment.stylist_id,
            reminder_type: 'six_week',
            status: 'sent',
          });

        if (insertError) {
          console.error('Error logging reminder:', insertError);
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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in send-rebooking-reminder function:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

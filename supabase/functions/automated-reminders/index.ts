import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { Resend } from 'https://esm.sh/resend@4.0.0';
import { compressedJsonResponse, compressedErrorResponse, corsHeaders } from '../_shared/compression.ts';
import { checkRateLimit, rateLimitErrorResponse, getRateLimitHeaders, RATE_LIMITS } from '../_shared/rateLimiter.ts';

interface Database {
  public: {
    Tables: {
      appointments: {
        Row: {
          id: string;
          appointment_date: string;
          client_id: string;
          stylist_id: string;
          service_type: string;
          reminder_sent: boolean;
          status: string;
        };
      };
      client_profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          email: string;
          phone: string;
        };
      };
      stylist_profiles: {
        Row: {
          id: string;
          business_name: string;
          location: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string;
        };
      };
    };
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting
    const identifier = req.headers.get('x-forwarded-for') || 'automated-reminders';
    const { allowed, remaining, resetAt } = checkRateLimit(identifier, RATE_LIMITS.REMINDERS);
    
    if (!allowed) {
      console.warn(`Rate limit exceeded for ${identifier}`);
      return rateLimitErrorResponse(resetAt);
    }
    
    const rateLimitHeaders = getRateLimitHeaders(remaining, resetAt, RATE_LIMITS.REMINDERS.maxRequests);
    const supabaseClient = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'hA.I.r <onboarding@resend.dev>';

    // Get appointments in the next 24-48 hours that haven't been reminded
    const now = new Date();
    const reminderWindowStart = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
    const reminderWindowEnd = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 hours from now

    console.log('Checking for appointments between:', reminderWindowStart, 'and', reminderWindowEnd);

    const { data: appointments, error: appointmentsError } = await supabaseClient
      .from('appointments')
      .select(`
        id,
        appointment_date,
        service_type,
        reminder_sent,
        status,
        client_id,
        stylist_id,
        client_profiles!appointments_client_id_fkey(
          full_name,
          email,
          phone,
          user_id,
          profiles!client_profiles_user_id_fkey(
            email,
            phone
          )
        ),
        stylist_profiles!appointments_stylist_id_fkey(
          business_name,
          location
        )
      `)
      .eq('reminder_sent', false)
      .eq('status', 'scheduled')
      .gte('appointment_date', reminderWindowStart.toISOString())
      .lte('appointment_date', reminderWindowEnd.toISOString());

    if (appointmentsError) {
      console.error('Error fetching appointments:', appointmentsError);
      throw appointmentsError;
    }

    console.log(`Found ${appointments?.length || 0} appointments needing reminders`);

    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    if (!appointments || appointments.length === 0) {
      return await compressedJsonResponse({ 
        message: 'No appointments need reminders at this time',
        results 
      }, 200);
    }

    // Send reminders for each appointment
    for (const appointment of appointments) {
      try {
        const clientProfile = appointment.client_profiles as any;
        const stylistProfile = appointment.stylist_profiles as any;
        const userProfile = clientProfile?.profiles;

        const clientEmail = clientProfile?.email || userProfile?.email;
        const clientName = clientProfile?.full_name || 'Valued Client';
        const clientPhone = clientProfile?.phone || userProfile?.phone;

        if (!clientEmail) {
          console.warn(`No email found for appointment ${appointment.id}`);
          results.failed++;
          results.errors.push(`No email for appointment ${appointment.id}`);
          continue;
        }

        const appointmentDate = new Date(appointment.appointment_date);
        const formattedDate = appointmentDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        const formattedTime = appointmentDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        });

        // Send email reminder
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Appointment Reminder</h2>
            <p>Hi ${clientName},</p>
            <p>This is a friendly reminder about your upcoming appointment:</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 10px 0;"><strong>Service:</strong> ${appointment.service_type}</p>
              <p style="margin: 10px 0;"><strong>Date:</strong> ${formattedDate}</p>
              <p style="margin: 10px 0;"><strong>Time:</strong> ${formattedTime}</p>
              ${stylistProfile ? `<p style="margin: 10px 0;"><strong>Location:</strong> ${stylistProfile.business_name}${stylistProfile.location ? `, ${stylistProfile.location}` : ''}</p>` : ''}
            </div>
            <p>We look forward to seeing you!</p>
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              If you need to reschedule or cancel, please contact us as soon as possible.
            </p>
          </div>
        `;

        const { error: emailError } = await resend.emails.send({
          from: FROM_EMAIL,
          to: [clientEmail],
          subject: `Reminder: Your appointment tomorrow at ${formattedTime}`,
          html: emailHtml,
        });

        if (emailError) {
          console.error(`Failed to send email for appointment ${appointment.id}:`, emailError);
          results.failed++;
          results.errors.push(`Email failed for ${appointment.id}: ${emailError.message}`);
          continue;
        }

        // Send SMS if phone number exists and Twilio is configured
        const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID');
        const twilioAuth = Deno.env.get('TWILIO_AUTH_TOKEN');
        const twilioPhone = Deno.env.get('TWILIO_PHONE_NUMBER');

        if (clientPhone && twilioSid && twilioAuth && twilioPhone) {
          try {
            const smsBody = `Reminder: Your ${appointment.service_type} appointment is tomorrow (${formattedDate}) at ${formattedTime}. See you then!`;
            
            const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
            const twilioResponse = await fetch(twilioUrl, {
              method: 'POST',
              headers: {
                'Authorization': 'Basic ' + btoa(`${twilioSid}:${twilioAuth}`),
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                To: clientPhone,
                From: twilioPhone,
                Body: smsBody,
              }),
            });

            if (!twilioResponse.ok) {
              console.warn(`SMS failed for appointment ${appointment.id}`);
            }
          } catch (smsError) {
            console.warn(`SMS error for appointment ${appointment.id}:`, smsError);
          }
        }

        // Mark reminder as sent
        const { error: updateError } = await supabaseClient
          .from('appointments')
          .update({ reminder_sent: true })
          .eq('id', appointment.id);

        if (updateError) {
          console.error(`Failed to update reminder status for ${appointment.id}:`, updateError);
          results.errors.push(`Update failed for ${appointment.id}`);
        }

        results.sent++;
        console.log(`Successfully sent reminder for appointment ${appointment.id}`);
      } catch (error) {
        console.error(`Error processing appointment ${appointment.id}:`, error);
        results.failed++;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push(`Error for ${appointment.id}: ${errorMsg}`);
      }
    }

    return await compressedJsonResponse({
      message: `Processed ${appointments.length} appointments`,
      results,
    }, 200, { ...rateLimitHeaders });
  } catch (error) {
    console.error('Error in automated-reminders function:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return await compressedErrorResponse(errorMsg, 500);
  }
});

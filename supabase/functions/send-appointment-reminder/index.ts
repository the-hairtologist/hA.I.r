import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AppointmentReminderRequest {
  hoursBeforeAppointment?: number; // 24 or 1 for 24h/1h reminders
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { hoursBeforeAppointment = 24 }: AppointmentReminderRequest = await req.json();

    // Get current time and target time
    const now = new Date();
    const targetTime = new Date(now.getTime() + (hoursBeforeAppointment * 60 * 60 * 1000));
    const windowStart = new Date(targetTime.getTime() - (30 * 60 * 1000)); // 30 min before
    const windowEnd = new Date(targetTime.getTime() + (30 * 60 * 1000)); // 30 min after

    console.log(`Looking for appointments between ${windowStart.toISOString()} and ${windowEnd.toISOString()}`);

    // Find appointments that need reminders
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select(`
        *,
        stylist:stylist_profiles(
          id,
          business_name,
          user:profiles(full_name, email)
        ),
        client:client_profiles(
          id,
          user:profiles(full_name, email)
        )
      `)
      .in('status', ['scheduled', 'confirmed'])
      .gte('appointment_date', windowStart.toISOString())
      .lte('appointment_date', windowEnd.toISOString());

    if (appointmentsError) {
      throw appointmentsError;
    }

    console.log(`Found ${appointments?.length || 0} appointments to send reminders for`);

    const results = [];

    for (const appointment of appointments || []) {
      try {
        const clientEmail = appointment.client?.user?.email;
        const clientName = appointment.client?.user?.full_name || 'Client';
        const stylistName = appointment.stylist?.user?.full_name || appointment.stylist?.business_name || 'Your Stylist';
        const appointmentDate = new Date(appointment.appointment_date);
        
        if (!clientEmail) {
          console.log(`Skipping appointment ${appointment.id} - no client email`);
          continue;
        }

        const emailHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .appointment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
                .detail-row { margin: 10px 0; }
                .label { font-weight: bold; color: #667eea; }
                .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>✂️ Appointment Reminder</h1>
                </div>
                <div class="content">
                  <p>Hi ${clientName},</p>
                  <p>This is a friendly reminder about your upcoming appointment ${hoursBeforeAppointment === 1 ? 'in 1 hour' : 'tomorrow'}!</p>
                  
                  <div class="appointment-details">
                    <div class="detail-row">
                      <span class="label">Stylist:</span> ${stylistName}
                    </div>
                    <div class="detail-row">
                      <span class="label">Service:</span> ${appointment.service_type}
                    </div>
                    <div class="detail-row">
                      <span class="label">Date & Time:</span> ${appointmentDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })} at ${appointmentDate.toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit' 
                      })}
                    </div>
                    <div class="detail-row">
                      <span class="label">Duration:</span> ${appointment.duration_minutes} minutes
                    </div>
                    ${appointment.notes ? `<div class="detail-row"><span class="label">Notes:</span> ${appointment.notes}</div>` : ''}
                  </div>

                  <p>We look forward to seeing you!</p>
                  <p>If you need to reschedule or cancel, please contact your stylist as soon as possible.</p>

                  <div class="footer">
                    <p>hA.I.r - Your AI-Powered Salon Assistant</p>
                    <p>This is an automated reminder. Please do not reply to this email.</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `;

        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'hA.I.r <onboarding@resend.dev>',
            to: [clientEmail],
            subject: `Reminder: Appointment ${hoursBeforeAppointment === 1 ? 'in 1 hour' : 'tomorrow'} with ${stylistName}`,
            html: emailHtml,
          }),
        });

        const result = await response.json();
        
        if (response.ok) {
          console.log(`Sent ${hoursBeforeAppointment}h reminder for appointment ${appointment.id}`);
          results.push({ appointmentId: appointment.id, status: 'sent', emailId: result.id });
        } else {
          console.error(`Failed to send reminder for appointment ${appointment.id}:`, result);
          results.push({ appointmentId: appointment.id, status: 'failed', error: result });
        }
      } catch (error) {
        console.error(`Error processing appointment ${appointment.id}:`, error);
        results.push({ appointmentId: appointment.id, status: 'error', error: String(error) });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${appointments?.length || 0} appointments`,
        results 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error in send-appointment-reminder:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: String(error)
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
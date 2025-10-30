import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';
import { Resend } from 'https://esm.sh/resend@2.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};
const FROM_EMAIL =
  Deno.env.get('FROM_EMAIL') || 'hA.I.r <onboarding@resend.dev>';

serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔔 Starting appointment reminder service');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const resend = new Resend(Deno.env.get('RESEND_API_KEY') ?? '');

    // Get appointments in the next 24 hours that haven't been reminded
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const { data: appointments, error } = await supabaseClient
      .from('appointments')
      .select(
        `
        *,
        client:client_profiles(
          full_name,
          email,
          user:profiles(email, full_name)
        ),
        stylist:stylist_profiles(
          business_name,
          user:profiles(full_name)
        )
      `
      )
      .gte('appointment_date', tomorrow.toISOString())
      .lt('appointment_date', dayAfter.toISOString())
      .eq('status', 'confirmed')
      .is('reminder_sent', false);

    if (error) throw error;

    console.log(`📋 Found ${appointments?.length || 0} appointments to remind`);

    let sentCount = 0;

    for (const appointment of appointments || []) {
      try {
        const clientEmail =
          appointment.client?.email || appointment.client?.user?.email;
        const clientName =
          appointment.client?.full_name ||
          appointment.client?.user?.full_name ||
          'Client';
        const stylistName =
          appointment.stylist?.user?.full_name ||
          appointment.stylist?.business_name ||
          'Your Stylist';

        if (!clientEmail) {
          console.log(`⚠️ No email for appointment ${appointment.id}`);
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

        await resend.emails.send({
          from: FROM_EMAIL,
          to: [clientEmail],
          subject: '🎉 Appointment Reminder - Tomorrow!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #ec4899; font-size: 28px;">Appointment Reminder! ✨</h1>
              
              <p style="font-size: 16px;">Hi ${clientName}!</p>
              
              <p style="font-size: 16px;">Just a friendly reminder about your upcoming appointment:</p>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>📅 Date:</strong> ${formattedDate}</p>
                <p style="margin: 5px 0;"><strong>🕐 Time:</strong> ${formattedTime}</p>
                <p style="margin: 5px 0;"><strong>💇 Service:</strong> ${appointment.service_type}</p>
                <p style="margin: 5px 0;"><strong>✂️ Stylist:</strong> ${stylistName}</p>
              </div>
              
              <p style="font-size: 16px;">We're excited to see you! If you need to reschedule, please contact us as soon as possible.</p>
              
              <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                Questions? Reply to this email or contact your stylist directly.
              </p>
            </div>
          `,
        });

        // Mark reminder as sent
        await supabaseClient
          .from('appointments')
          .update({ reminder_sent: true })
          .eq('id', appointment.id);

        sentCount++;
        console.log(`✅ Sent reminder for appointment ${appointment.id}`);
      } catch (emailError) {
        console.error(
          `❌ Error sending reminder for appointment ${appointment.id}:`,
          emailError
        );
      }
    }

    console.log(`📧 Successfully sent ${sentCount} reminders`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: sentCount,
        total: appointments?.length || 0,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Error in reminder service:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

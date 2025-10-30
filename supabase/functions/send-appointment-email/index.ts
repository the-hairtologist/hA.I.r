import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { Resend } from 'https://esm.sh/resend@2.0.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
const FROM_EMAIL =
  Deno.env.get('FROM_EMAIL') || 'hA.I.r <onboarding@resend.dev>';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

interface AppointmentEmailRequest {
  appointmentId: string;
  type: 'confirmation' | 'reminder';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { appointmentId, type }: AppointmentEmailRequest = await req.json();

    // Fetch appointment details with related data
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select(
        `
        *,
        stylist:stylist_profiles(user_id),
        client:client_profiles(user_id)
      `
      )
      .eq('id', appointmentId)
      .single();

    if (appointmentError || !appointment) {
      throw new Error('Appointment not found');
    }

    // Fetch stylist and client user data
    const { data: stylistUser } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', appointment.stylist.user_id)
      .single();

    const { data: clientUser } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', appointment.client.user_id)
      .single();

    if (!stylistUser || !clientUser) {
      throw new Error('User data not found');
    }

    const appointmentDate = new Date(
      appointment.appointment_date
    ).toLocaleString();

    let subject = '';
    let html = '';

    if (type === 'confirmation') {
      subject = 'Appointment Confirmation - hA.I.r';
      html = `
        <h1>Appointment Confirmed!</h1>
        <p>Hello ${clientUser.full_name},</p>
        <p>Your appointment has been confirmed with the following details:</p>
        <ul>
          <li><strong>Service:</strong> ${appointment.service_type}</li>
          <li><strong>Date & Time:</strong> ${appointmentDate}</li>
          <li><strong>Duration:</strong> ${appointment.duration_minutes} minutes</li>
          <li><strong>Stylist:</strong> ${stylistUser.full_name}</li>
        </ul>
        ${appointment.notes ? `<p><strong>Notes:</strong> ${appointment.notes}</p>` : ''}
        <p>We look forward to seeing you!</p>
        <p>Best regards,<br>hA.I.r Team</p>
      `;
    } else {
      subject = 'Appointment Reminder - hA.I.r';
      html = `
        <h1>Appointment Reminder</h1>
        <p>Hello ${clientUser.full_name},</p>
        <p>This is a friendly reminder about your upcoming appointment:</p>
        <ul>
          <li><strong>Service:</strong> ${appointment.service_type}</li>
          <li><strong>Date & Time:</strong> ${appointmentDate}</li>
          <li><strong>Duration:</strong> ${appointment.duration_minutes} minutes</li>
          <li><strong>Stylist:</strong> ${stylistUser.full_name}</li>
        </ul>
        <p>See you soon!</p>
        <p>Best regards,<br>hA.I.r Team</p>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: FROM_EMAIL,
      to: [clientUser.email],
      subject,
      html,
    });

    console.log('Email sent successfully:', emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error: any) {
    console.error('Error sending appointment email:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('💌 Finding inactive clients for re-engagement...');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find clients who haven't had an appointment in 90+ days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { data: inactiveClients, error } = await supabase
      .from('client_profiles')
      .select(`
        id,
        profiles!inner (
          id,
          email,
          full_name
        ),
        preferred_stylist:stylist_profiles!preferred_stylist_id (
          profiles!inner (
            full_name
          )
        ),
        appointments!client_id (
          appointment_date
        )
      `);

    if (error) throw error;

    // Filter for truly inactive clients (last appointment > 90 days ago)
    const inactiveList = inactiveClients?.filter(client => {
      const appointments = client.appointments || [];
      if (appointments.length === 0) return false; // Skip if never had appointment
      
      const lastAppointment = appointments
        .map(a => new Date(a.appointment_date))
        .sort((a, b) => b.getTime() - a.getTime())[0];
      
      return lastAppointment < ninetyDaysAgo;
    }) || [];

    console.log(`Found ${inactiveList.length} inactive clients`);

    let sent = 0;
    const errors: string[] = [];

    for (const client of inactiveList) {
      try {
        const clientData = client.profiles as any;
        const clientEmail = Array.isArray(clientData) ? clientData[0]?.email : clientData.email;
        const clientName = Array.isArray(clientData) ? clientData[0]?.full_name : clientData.full_name;
        const stylistData = (client.preferred_stylist as any)?.profiles;
        const stylistName = Array.isArray(stylistData) ? stylistData[0]?.full_name : stylistData?.full_name || 'Your Stylist';

        // Check if already sent re-engagement recently (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        // Skip for now, send to all (in production you'd track sent emails)

        await resend.emails.send({
          from: 'Hair A.I. <noreply@hair-ai.app>',
          to: [clientEmail],
          subject: `${clientName}, we miss you! 💜`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #8B5CF6;">We Miss You, ${clientName}! 💜</h1>
              <p>It's been a while since your last visit with ${stylistName}, and we'd love to see you again!</p>
              <p>Your hair deserves the royal treatment, and we have something special for you:</p>
              <div style="background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); padding: 30px; border-radius: 12px; margin: 20px 0; text-align: center; color: white;">
                <p style="margin: 0; font-size: 20px; font-weight: bold;">Welcome Back Offer</p>
                <p style="margin: 10px 0; font-size: 36px; font-weight: bold;">25% OFF</p>
                <p style="margin: 5px 0; font-size: 14px;">Your next appointment</p>
                <p style="margin: 15px 0; font-size: 14px; background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; display: inline-block;">
                  Code: WELCOMEBACK25
                </p>
                <p style="margin: 5px 0; font-size: 12px; opacity: 0.9;">Valid for 30 days</p>
              </div>
              <p style="font-size: 16px; margin: 20px 0;">
                Book your comeback appointment now and let ${stylistName} work their magic! ✨
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovableproject.com')}/book-appointment" 
                   style="background: #8B5CF6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                  Book Now
                </a>
              </div>
              <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
                Can't wait to see you soon!<br>
                ${stylistName} & Hair A.I.
              </p>
            </div>
          `,
        });

        sent++;
        console.log(`✅ Re-engagement email sent to ${clientEmail}`);
      } catch (emailError) {
        const msg = emailError instanceof Error ? emailError.message : 'Unknown error';
        const clientData = client.profiles as any;
        const email = Array.isArray(clientData) ? clientData[0]?.email : clientData.email;
        errors.push(`${email}: ${msg}`);
        console.error(`❌ Failed to send to ${email}:`, msg);
      }
    }

    return new Response(JSON.stringify({ 
      sent, 
      total: inactiveList.length,
      errors: errors.length > 0 ? errors : undefined
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('❌ Error in re-engagement function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

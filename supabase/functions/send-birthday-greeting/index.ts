import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "npm:resend@2.0.0";

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
    console.log('🎂 Sending birthday greetings...');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const today = new Date();
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();

    // Find clients with birthdays today
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        birthday,
        client_profiles!inner (
          id,
          preferred_stylist_id,
          stylist:stylist_profiles!preferred_stylist_id (
            profiles!inner (
              full_name
            )
          )
        )
      `)
      .not('birthday', 'is', null);

    if (error) throw error;

    const birthdayProfiles = profiles?.filter(profile => {
      if (!profile.birthday) return false;
      const birthday = new Date(profile.birthday);
      return birthday.getMonth() + 1 === todayMonth && birthday.getDate() === todayDay;
    }) || [];

    console.log(`Found ${birthdayProfiles.length} birthday(s) today`);

    let sent = 0;
    const errors: string[] = [];

    for (const profile of birthdayProfiles) {
      try {
        const stylistName = profile.client_profiles?.[0]?.stylist?.profiles?.full_name || 'Your Stylist';
        
        await resend.emails.send({
          from: 'Hair A.I. <noreply@hair-ai.app>',
          to: [profile.email],
          subject: `🎉 Happy Birthday ${profile.full_name}! 🎂`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #8B5CF6;">🎂 Happy Birthday, ${profile.full_name}! 🎉</h1>
              <p>Your stylist ${stylistName} and the entire Hair A.I. team wish you the most amazing birthday!</p>
              <p>To celebrate your special day, we'd love to treat you to <strong>20% off your next appointment</strong>!</p>
              <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #6B7280;">Use code:</p>
                <p style="margin: 5px 0; font-size: 24px; font-weight: bold; color: #8B5CF6;">BIRTHDAY20</p>
                <p style="margin: 0; font-size: 12px; color: #9CA3AF;">Valid for 30 days</p>
              </div>
              <p>Book your celebration appointment today! 💜</p>
              <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
                With love,<br>
                ${stylistName} & Hair A.I.
              </p>
            </div>
          `,
        });

        sent++;
        console.log(`✅ Birthday email sent to ${profile.email}`);
      } catch (emailError) {
        const msg = emailError instanceof Error ? emailError.message : 'Unknown error';
        errors.push(`${profile.email}: ${msg}`);
        console.error(`❌ Failed to send to ${profile.email}:`, msg);
      }
    }

    return new Response(JSON.stringify({ 
      sent, 
      total: birthdayProfiles.length,
      errors: errors.length > 0 ? errors : undefined
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('❌ Error in birthday greeting function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

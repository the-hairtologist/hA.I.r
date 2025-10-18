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
    console.log('🏆 Checking loyalty milestones...');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find new milestones that haven't been emailed yet
    const { data: milestones, error } = await supabase
      .from('client_milestones')
      .select(`
        *,
        client:client_profiles!inner (
          profiles!inner (
            email,
            full_name
          )
        ),
        stylist:stylist_profiles!inner (
          profiles!inner (
            full_name
          )
        )
      `)
      .is('email_sent_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log(`Found ${milestones?.length || 0} new milestones`);

    let sent = 0;
    const errors: string[] = [];

    for (const milestone of milestones || []) {
      try {
        const clientEmail = milestone.client.profiles.email;
        const clientName = milestone.client.profiles.full_name;
        const stylistName = milestone.stylist.profiles.full_name;

        const milestoneText = milestone.milestone_type === 'appointments'
          ? `${milestone.milestone_value} appointments`
          : `${milestone.milestone_value} year${milestone.milestone_value > 1 ? 's' : ''} together`;

        await resend.emails.send({
          from: 'Hair A.I. <noreply@hair-ai.app>',
          to: [clientEmail],
          subject: `🎉 You've reached a milestone with ${stylistName}!`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #8B5CF6;">🎉 Congratulations, ${clientName}!</h1>
              <p>You've reached an amazing milestone: <strong>${milestoneText}</strong> with ${stylistName}!</p>
              <p>To celebrate your loyalty, here's an exclusive reward:</p>
              <div style="background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); padding: 30px; border-radius: 12px; margin: 20px 0; text-align: center; color: white;">
                <p style="margin: 0; font-size: 16px; opacity: 0.9;">Your Reward</p>
                <p style="margin: 10px 0; font-size: 32px; font-weight: bold;">$${milestone.discount_amount} OFF</p>
                <p style="margin: 5px 0; font-size: 14px; background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; display: inline-block;">
                  Code: ${milestone.discount_code}
                </p>
              </div>
              <p>Thank you for being such a wonderful client! We can't wait to see you again! 💜</p>
              <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
                With gratitude,<br>
                ${stylistName} & Hair A.I.
              </p>
            </div>
          `,
        });

        // Mark as sent
        await supabase
          .from('client_milestones')
          .update({ email_sent_at: new Date().toISOString() })
          .eq('id', milestone.id);

        sent++;
        console.log(`✅ Milestone email sent to ${clientEmail}`);
      } catch (emailError) {
        const msg = emailError instanceof Error ? emailError.message : 'Unknown error';
        errors.push(`Milestone ${milestone.id}: ${msg}`);
        console.error(`❌ Failed to send milestone email:`, msg);
      }
    }

    return new Response(JSON.stringify({ 
      sent, 
      total: milestones?.length || 0,
      errors: errors.length > 0 ? errors : undefined
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('❌ Error in loyalty milestone function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

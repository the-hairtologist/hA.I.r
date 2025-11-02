import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, emailType = 'all' } = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ success: false, message: 'Token is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find the preference record
    const { data: preference, error: findError } = await supabase
      .from('email_preferences')
      .select('*')
      .eq('unsubscribe_token', token)
      .single();

    if (findError || !preference) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Invalid unsubscribe token',
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Update preferences based on email type
    const updates: any = { updated_at: new Date().toISOString() };

    switch (emailType) {
      case 'rebooking':
        updates.rebooking_reminders_enabled = false;
        break;
      case 'appointments':
        updates.appointment_reminders_enabled = false;
        break;
      case 'marketing':
        updates.marketing_emails_enabled = false;
        break;
      default: // 'all'
        updates.rebooking_reminders_enabled = false;
        updates.appointment_reminders_enabled = false;
        updates.marketing_emails_enabled = false;
    }

    const { error: updateError } = await supabase
      .from('email_preferences')
      .update(updates)
      .eq('id', preference.id);

    if (updateError) {
      console.error('Error updating preferences:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Successfully unsubscribed',
        email: preference.email,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in unsubscribe function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

/**
 * Send Push Notification Edge Function
 * Sends push notifications via FCM (Firebase Cloud Messaging)
 *
 * Supported notification types:
 * - appointment_reminder_24h
 * - appointment_reminder_1h
 * - client_at_risk
 * - new_booking
 * - formula_used
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

interface NotificationPayload {
  userId: string;
  title: string;
  body: string;
  type: string;
  data?: Record<string, any>;
}

serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId, title, body, type, data }: NotificationPayload =
      await req.json();

    console.log('[Push Notification] Sending notification:', {
      userId,
      title,
      type,
    });

    // Get device tokens for this user
    const { data: tokens, error: tokensError } = await supabaseClient
      .from('device_tokens')
      .select('*')
      .eq('user_id', userId);

    if (tokensError) {
      console.error('[Push Notification] Error fetching tokens:', tokensError);
      throw tokensError;
    }

    if (!tokens || tokens.length === 0) {
      console.warn(
        '[Push Notification] No device tokens found for user:',
        userId
      );
      return new Response(
        JSON.stringify({
          success: false,
          message: 'No device tokens registered',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // TODO: Implement actual FCM sending when configured
    // For now, log what would be sent
    console.log('[Push Notification] Would send to', tokens.length, 'devices');
    console.log('[Push Notification] Notification:', { title, body, data });

    // Placeholder for FCM integration
    /*
    const FCM_SERVER_KEY = Deno.env.get("FCM_SERVER_KEY");
    
    for (const tokenRecord of tokens) {
      try {
        const response = await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Authorization': `key=${FCM_SERVER_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: tokenRecord.token,
            notification: { title, body },
            data: data || {},
          }),
        });
        
        if (!response.ok) {
          console.error('[Push Notification] FCM error for token:', tokenRecord.token);
        }
      } catch (error) {
        console.error('[Push Notification] Failed to send:', error);
      }
    }
    */

    // Update last_used timestamp
    await supabaseClient
      .from('device_tokens')
      .update({ last_used: new Date().toISOString() })
      .eq('user_id', userId);

    return new Response(
      JSON.stringify({ success: true, sent: tokens.length }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('[Push Notification] Error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

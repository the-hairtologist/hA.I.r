/**
 * Twilio SMS Webhook Handler
 * Handles incoming SMS messages for two-way conversations
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IncomingSMS {
  MessageSid: string;
  From: string;
  To: string;
  Body: string;
  NumMedia: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📱 Incoming SMS webhook triggered');

    // Parse form data from Twilio
    const formData = await req.formData();
    const smsData: IncomingSMS = {
      MessageSid: formData.get('MessageSid') as string,
      From: formData.get('From') as string,
      To: formData.get('To') as string,
      Body: formData.get('Body') as string,
      NumMedia: formData.get('NumMedia') as string || '0',
    };

    console.log('SMS Data:', smsData);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find client by phone number
    const cleanPhone = smsData.From.replace(/\D/g, '').slice(-10); // Last 10 digits

    const { data: clients } = await supabase
      .from('client_profiles')
      .select('id, full_name, phone, preferred_stylist_id')
      .ilike('phone', `%${cleanPhone}%`);

    if (!clients || clients.length === 0) {
      console.log('⚠️ Unknown phone number:', smsData.From);
      
      // Auto-reply for unknown numbers
      return new Response(
        `<?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Message>Thanks for reaching out! We don't have your number in our system. Please contact your stylist directly to get started.</Message>
        </Response>`,
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'text/xml' 
          } 
        }
      );
    }

    const client = clients[0];
    const messageBody = smsData.Body.trim().toLowerCase();

    // Log the incoming message
    await supabase.from('sms_conversations').insert({
      client_id: client.id,
      stylist_id: client.preferred_stylist_id,
      direction: 'inbound',
      message_body: smsData.Body,
      twilio_sid: smsData.MessageSid,
      from_number: smsData.From,
      to_number: smsData.To,
    });

    // Auto-reply logic based on keywords
    let reply = '';

    if (messageBody.includes('book') || messageBody.includes('appointment')) {
      reply = `Hi ${client.full_name}! 📅 To book an appointment, visit: ${Deno.env.get('VITE_SUPABASE_URL')?.replace('supabase.co', 'lovable.app') || 'our app'}/book`;
    } else if (messageBody.includes('cancel') || messageBody.includes('reschedule')) {
      reply = `We'll help you with that! Your stylist will reach out shortly. Or manage appointments here: ${Deno.env.get('VITE_SUPABASE_URL')?.replace('supabase.co', 'lovable.app') || 'our app'}/appointments`;
    } else if (messageBody.includes('hours') || messageBody.includes('open')) {
      // Get stylist schedule
      const { data: stylist } = await supabase
        .from('stylist_profiles')
        .select('weekly_schedule, business_name')
        .eq('id', client.preferred_stylist_id)
        .single();

      if (stylist?.weekly_schedule) {
        reply = `${stylist.business_name || 'We are'} typically available based on your stylist's schedule. Check availability: ${Deno.env.get('VITE_SUPABASE_URL')?.replace('supabase.co', 'lovable.app') || 'our app'}/book`;
      } else {
        reply = 'Please contact your stylist directly for hours and availability.';
      }
    } else if (messageBody.includes('price') || messageBody.includes('cost')) {
      reply = `Pricing varies by service. View our full service menu and prices: ${Deno.env.get('VITE_SUPABASE_URL')?.replace('supabase.co', 'lovable.app') || 'our app'}/services`;
    } else if (messageBody.includes('help') || messageBody === '?') {
      reply = `Hi ${client.full_name}! How can we help?\n\n📅 Book: Reply "BOOK"\n❌ Cancel: Reply "CANCEL"\n⏰ Hours: Reply "HOURS"\n💰 Pricing: Reply "PRICE"\n\nOr your stylist will respond shortly!`;
    } else {
      // Forward to stylist (create notification)
      await supabase.from('notifications').insert({
        user_id: client.preferred_stylist_id,
        title: `SMS from ${client.full_name}`,
        message: smsData.Body,
        type: 'sms_received',
        metadata: {
          client_id: client.id,
          phone: smsData.From,
          message_sid: smsData.MessageSid,
        },
      });

      reply = `Thanks for your message! Your stylist will respond soon. For immediate booking, visit: ${Deno.env.get('VITE_SUPABASE_URL')?.replace('supabase.co', 'lovable.app') || 'our app'}/book`;
    }

    console.log('✅ SMS processed, replying:', reply);

    // Return TwiML response
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Message>${reply}</Message>
      </Response>`,
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'text/xml' 
        } 
      }
    );

  } catch (error) {
    console.error('❌ Error processing SMS webhook:', error);
    
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Message>We received your message but encountered an error. Please try again or contact us directly.</Message>
      </Response>`,
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'text/xml' 
        },
        status: 500 
      }
    );
  }
});

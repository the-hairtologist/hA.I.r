import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  appointmentId: string;
  amount: number;
  paymentMethod: string;
  metadata?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { appointmentId, amount, paymentMethod, metadata = {} }: PaymentRequest = 
      await req.json();

    if (!appointmentId || !amount || !paymentMethod) {
      throw new Error('Missing required fields: appointmentId, amount, paymentMethod');
    }

    // Verify appointment exists and user has permission
    const { data: appointment, error: appointmentError } = await supabaseClient
      .from('appointments')
      .select(`
        *,
        stylist_profiles!stylist_id (user_id),
        client_profiles!client_id (user_id)
      `)
      .eq('id', appointmentId)
      .single();

    if (appointmentError || !appointment) {
      throw new Error('Appointment not found');
    }

    // Verify user is either the stylist or client
    const isStylist = appointment.stylist_profiles?.user_id === user.id;
    const isClient = appointment.client_profiles?.user_id === user.id;

    if (!isStylist && !isClient) {
      throw new Error('Unauthorized to finalize payment for this appointment');
    }

    // TODO: Integrate with actual payment processor (Stripe, Square, etc.)
    // For now, just record the payment intent

    const paymentRecord = {
      appointment_id: appointmentId,
      amount,
      payment_method: paymentMethod,
      status: 'completed',
      processed_by: user.id,
      processed_at: new Date().toISOString(),
      metadata: {
        ...metadata,
        user_role: isStylist ? 'stylist' : 'client',
      },
    };

    // Log payment (you'd create a payments table for this)
    console.log('Payment finalized:', paymentRecord);

    // Update appointment status if needed
    if (appointment.status !== 'completed') {
      const { error: updateError } = await supabaseClient
        .from('appointments')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', appointmentId);

      if (updateError) {
        console.error('Error updating appointment:', updateError);
        throw new Error('Failed to update appointment status');
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Payment finalized successfully',
        payment: paymentRecord,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Payment finalization error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500,
      }
    );
  }
});
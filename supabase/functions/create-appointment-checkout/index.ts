import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

// Input validation schemas
const uuidSchema = z.string().uuid();
const appointmentDataSchema = z.object({
  service_id: uuidSchema,
  duration_minutes: z.number().int().min(15).max(480),
  appointment_date: z.string().datetime(),
  notes: z.string().max(1000).optional(),
});

const requestSchema = z.object({
  appointmentData: appointmentDataSchema,
  clientEmail: z.string().email().max(255),
  clientName: z.string().min(1).max(255),
});

serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    });

    const body = await req.json();

    // Validate input
    const validationResult = requestSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid input',
          details: validationResult.error.issues
            .map(i => `${i.path.join('.')}: ${i.message}`)
            .join(', '),
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { appointmentData, clientEmail, clientName } = validationResult.data;

    // Get service details
    const { data: service, error: serviceError } = await supabase
      .from('stylist_services')
      .select('*, stylist:stylist_profiles(user:profiles(full_name))')
      .eq('id', appointmentData.service_id)
      .single();

    if (serviceError || !service) {
      throw new Error('Service not found');
    }

    // Calculate payment amount (deposit or full)
    const fullPrice = parseFloat(service.price);
    let paymentAmount = fullPrice;
    let isDeposit = false;
    let remainingBalance = 0;

    if (service.require_deposit) {
      isDeposit = true;
      if (service.deposit_type === 'percentage') {
        paymentAmount = (fullPrice * service.deposit_amount) / 100;
      } else {
        paymentAmount = parseFloat(service.deposit_amount);
      }
      remainingBalance = fullPrice - paymentAmount;
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${isDeposit ? 'Deposit for ' : ''}${service.service_name}`,
              description: `Appointment with ${service.stylist.user.full_name} - ${appointmentData.duration_minutes} minutes${isDeposit ? ` (Balance: $${remainingBalance.toFixed(2)})` : ''}`,
            },
            unit_amount: Math.round(paymentAmount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/my-appointments?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/book-appointment?payment=cancelled`,
      customer_email: clientEmail,
      metadata: {
        appointment_data: JSON.stringify(appointmentData),
        client_name: clientName,
        is_deposit: isDeposit.toString(),
        remaining_balance: remainingBalance.toFixed(2),
        full_price: fullPrice.toFixed(2),
      },
    });

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
        isDeposit,
        depositAmount: paymentAmount.toFixed(2),
        remainingBalance: remainingBalance.toFixed(2),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

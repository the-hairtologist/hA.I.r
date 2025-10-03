import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@14.21.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
})

const cryptoProvider = Stripe.createSubtleCryptoProvider()

serve(async (request) => {
  const signature = request.headers.get('Stripe-Signature')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

  if (!signature || !webhookSecret) {
    return new Response('Missing signature or webhook secret', { status: 400 })
  }

  try {
    const body = await request.text()
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider
    )

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      // Parse appointment data from metadata
      const appointmentData = JSON.parse(session.metadata?.appointment_data || '{}')

      // Create the appointment
      const { data: appointment, error: aptError } = await supabase
        .from('appointments')
        .insert({
          stylist_id: appointmentData.stylist_id,
          client_id: appointmentData.client_id,
          appointment_date: appointmentData.appointment_date,
          service_type: appointmentData.service_type,
          service_id: appointmentData.service_id,
          duration_minutes: appointmentData.duration_minutes,
          notes: appointmentData.notes || null,
          status: 'confirmed', // Auto-confirm paid appointments
        })
        .select()
        .single()

      if (aptError) {
        console.error('Error creating appointment:', aptError)
        throw aptError
      }

      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          stylist_id: appointmentData.stylist_id,
          client_id: appointmentData.client_id,
          appointment_id: appointment.id,
          amount: session.amount_total ? session.amount_total / 100 : 0,
          payment_method: 'card',
          status: 'completed',
        })

      if (paymentError) {
        console.error('Error creating payment record:', paymentError)
      }

      // Send confirmation email
      try {
        await supabase.functions.invoke('send-appointment-confirmation', {
          body: {
            appointmentId: appointment.id,
          },
        })
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError)
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err: any) {
    console.error('Webhook error:', err.message)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }
})

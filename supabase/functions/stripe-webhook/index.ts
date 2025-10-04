import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@14.21.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
})

const cryptoProvider = Stripe.createSubtleCryptoProvider()

console.log('[STRIPE-WEBHOOK] Function initialized')

serve(async (request) => {
  const signature = request.headers.get('Stripe-Signature')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

  console.log('[STRIPE-WEBHOOK] Received webhook request')

  if (!signature || !webhookSecret) {
    console.error('[STRIPE-WEBHOOK] Missing signature or webhook secret')
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

    console.log('[STRIPE-WEBHOOK] Event type:', event.type)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      console.log('[STRIPE-WEBHOOK] Processing checkout.session.completed')
      console.log('[STRIPE-WEBHOOK] Session ID:', session.id)
      console.log('[STRIPE-WEBHOOK] Metadata:', session.metadata)

      // Parse appointment data from metadata
      const appointmentData = JSON.parse(session.metadata?.appointment_data || '{}')
      const isDeposit = session.metadata?.is_deposit === 'true'
      const remainingBalance = parseFloat(session.metadata?.remaining_balance || '0')
      const fullPrice = parseFloat(session.metadata?.full_price || '0')
      const amountPaid = session.amount_total ? session.amount_total / 100 : 0

      console.log('[STRIPE-WEBHOOK] Appointment data:', appointmentData)
      console.log('[STRIPE-WEBHOOK] Is deposit:', isDeposit)
      console.log('[STRIPE-WEBHOOK] Amount paid:', amountPaid)
      console.log('[STRIPE-WEBHOOK] Remaining balance:', remainingBalance)

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
        console.error('[STRIPE-WEBHOOK] Error creating appointment:', aptError)
        throw aptError
      }

      console.log('[STRIPE-WEBHOOK] Appointment created:', appointment.id)

      // Create payment record with deposit tracking
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          stylist_id: appointmentData.stylist_id,
          client_id: appointmentData.client_id,
          appointment_id: appointment.id,
          amount: amountPaid,
          payment_method: 'card',
          status: 'completed',
          is_deposit: isDeposit,
          remaining_balance: remainingBalance,
          payment_type: isDeposit ? 'deposit' : 'full',
        })

      if (paymentError) {
        console.error('[STRIPE-WEBHOOK] Error creating payment record:', paymentError)
        throw paymentError
      }

      console.log('[STRIPE-WEBHOOK] Payment record created')

      // Send confirmation email
      try {
        await supabase.functions.invoke('send-appointment-confirmation', {
          body: {
            appointmentId: appointment.id,
          },
        })
        console.log('[STRIPE-WEBHOOK] Confirmation email sent')
      } catch (emailError) {
        console.error('[STRIPE-WEBHOOK] Failed to send confirmation email:', emailError)
      }

      console.log('[STRIPE-WEBHOOK] Webhook processing completed successfully')
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err: any) {
    console.error('[STRIPE-WEBHOOK] Webhook error:', err.message)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }
})

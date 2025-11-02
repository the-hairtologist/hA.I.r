import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'https://esm.sh/resend@2.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
const FROM_EMAIL =
  Deno.env.get('FROM_EMAIL') || 'hA.I.r <onboarding@resend.dev>';

serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('📧 Processing email sequences...');

    // Get all active enrollments that need to send next email
    const { data: enrollments, error: enrollError } = await supabase
      .from('email_sequence_enrollments')
      .select(
        `
        *,
        client:client_profiles!email_sequence_enrollments_client_id_fkey(
          id,
          full_name,
          user:user_id(
            email
          )
        ),
        stylist:stylist_profiles!email_sequence_enrollments_stylist_id_fkey(
          id,
          user:user_id(
            full_name,
            email
          )
        ),
        sequence:email_sequences!email_sequence_enrollments_sequence_id_fkey(
          id,
          name
        )
      `
      )
      .eq('status', 'active')
      .lte('next_send_at', new Date().toISOString())
      .limit(50); // Process 50 at a time

    if (enrollError) throw enrollError;

    console.log(
      `Found ${enrollments?.length || 0} enrollments ready to process`
    );

    const results = {
      processed: 0,
      sent: 0,
      completed: 0,
      errors: [] as string[],
    };

    for (const enrollment of enrollments || []) {
      try {
        // Get the current step
        const { data: step, error: stepError } = await supabase
          .from('email_sequence_steps')
          .select('*')
          .eq('sequence_id', enrollment.sequence_id)
          .eq('step_order', enrollment.current_step)
          .single();

        if (stepError || !step) {
          console.warn(`Step not found for enrollment ${enrollment.id}`);

          // Mark as completed if no more steps
          await supabase
            .from('email_sequence_enrollments')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString(),
            })
            .eq('id', enrollment.id);

          results.completed++;
          continue;
        }

        // Check stop conditions (e.g., client booked an appointment)
        if (step.stop_on_conditions) {
          const shouldStop = await checkStopConditions(
            supabase,
            enrollment.client_id,
            step.stop_on_conditions
          );

          if (shouldStop) {
            console.log(`Stop condition met for enrollment ${enrollment.id}`);
            await supabase
              .from('email_sequence_enrollments')
              .update({
                status: 'stopped',
                unenrolled_at: new Date().toISOString(),
                unenrolled_reason: 'Stop condition met',
              })
              .eq('id', enrollment.id);

            results.processed++;
            continue;
          }
        }

        // Get client email
        const clientEmail = enrollment.client?.user?.email;
        const clientName = enrollment.client?.full_name || 'Valued Client';
        const stylistName =
          enrollment.stylist?.user?.full_name || 'Your Stylist';

        if (!clientEmail) {
          console.error(`No email found for enrollment ${enrollment.id}`);
          results.errors.push(`No email for enrollment ${enrollment.id}`);
          continue;
        }

        // Replace variables in subject and body
        const subject = replaceVariables(step.subject, {
          client_name: clientName,
          stylist_name: stylistName,
          sequence_name: enrollment.sequence?.name || '',
        });

        const body = replaceVariables(step.body_html, {
          client_name: clientName,
          stylist_name: stylistName,
          sequence_name: enrollment.sequence?.name || '',
          unsubscribe_url: `${supabaseUrl}/functions/v1/unsubscribe-email?enrollment_id=${enrollment.id}`,
        });

        // Send email via Resend
        const { data: emailData, error: emailError } = await resend.emails.send(
          {
            from: FROM_EMAIL,
            to: [clientEmail],
            subject,
            html: body,
          }
        );

        if (emailError) {
          console.error(
            `Failed to send email for enrollment ${enrollment.id}:`,
            emailError
          );
          results.errors.push(
            `Email failed for ${enrollment.id}: ${emailError.message}`
          );
          continue;
        }

        console.log(`✅ Email sent for enrollment ${enrollment.id}`);

        // Log the send
        await supabase.from('email_sequence_logs').insert({
          enrollment_id: enrollment.id,
          step_id: step.id,
          client_id: enrollment.client_id,
          stylist_id: enrollment.stylist_id,
          email_address: clientEmail,
          subject,
          resend_email_id: emailData?.id,
        });

        // Calculate next send time
        const nextStep = enrollment.current_step + 1;
        const { data: hasNextStep } = await supabase
          .from('email_sequence_steps')
          .select('id, delay_amount, delay_unit')
          .eq('sequence_id', enrollment.sequence_id)
          .eq('step_order', nextStep)
          .maybeSingle();

        if (hasNextStep) {
          // Calculate next_send_at based on delay
          const nextSendAt = calculateNextSendTime(
            hasNextStep.delay_amount,
            hasNextStep.delay_unit
          );

          await supabase
            .from('email_sequence_enrollments')
            .update({
              current_step: nextStep,
              next_send_at: nextSendAt,
            })
            .eq('id', enrollment.id);
        } else {
          // No more steps, mark as completed
          await supabase
            .from('email_sequence_enrollments')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString(),
            })
            .eq('id', enrollment.id);

          results.completed++;
        }

        results.processed++;
        results.sent++;
      } catch (error) {
        console.error(`Error processing enrollment ${enrollment.id}:`, error);
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        results.errors.push(`Enrollment ${enrollment.id}: ${errorMessage}`);
      }
    }

    console.log('✅ Processing complete:', results);

    return new Response(
      JSON.stringify({
        success: true,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Error in process-email-sequences:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

// Helper functions

function replaceVariables(
  text: string,
  variables: Record<string, string>
): string {
  let result = text;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  }
  return result;
}

function calculateNextSendTime(amount: number, unit: string): string {
  const now = new Date();

  switch (unit) {
    case 'minutes':
      now.setMinutes(now.getMinutes() + amount);
      break;
    case 'hours':
      now.setHours(now.getHours() + amount);
      break;
    case 'days':
      now.setDate(now.getDate() + amount);
      break;
    case 'weeks':
      now.setDate(now.getDate() + amount * 7);
      break;
    default:
      now.setDate(now.getDate() + amount);
  }

  return now.toISOString();
}

async function checkStopConditions(
  supabase: any,
  clientId: string,
  conditions: any
): Promise<boolean> {
  // Example: Stop if client booked an appointment
  if (conditions.client_booked) {
    const { data } = await supabase
      .from('appointments')
      .select('id')
      .eq('client_id', clientId)
      .gte('appointment_date', new Date().toISOString())
      .limit(1)
      .maybeSingle();

    return !!data;
  }

  return false;
}

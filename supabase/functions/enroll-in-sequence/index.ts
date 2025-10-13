import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation helper
const validateUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authHeader = req.headers.get('Authorization')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const body = await req.json();
    const { client_id, sequence_id, stylist_id } = body;

    // Validate required fields
    if (!client_id || !sequence_id || !stylist_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: client_id, sequence_id, and stylist_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate UUIDs
    if (!validateUUID(client_id) || !validateUUID(sequence_id) || !validateUUID(stylist_id)) {
      return new Response(
        JSON.stringify({ error: 'Invalid UUID format for one or more IDs' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Enrolling client ${client_id} in sequence ${sequence_id}`);

    // Check if already enrolled
    const { data: existing } = await supabase
      .from('email_sequence_enrollments')
      .select('id, status')
      .eq('client_id', client_id)
      .eq('sequence_id', sequence_id)
      .maybeSingle();

    if (existing && existing.status === 'active') {
      return new Response(
        JSON.stringify({ 
          error: 'Client is already enrolled in this sequence',
          enrollment_id: existing.id 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get first step to calculate next_send_at
    const { data: firstStep } = await supabase
      .from('email_sequence_steps')
      .select('delay_amount, delay_unit')
      .eq('sequence_id', sequence_id)
      .eq('step_order', 1)
      .single();

    if (!firstStep) {
      return new Response(
        JSON.stringify({ error: 'Sequence has no steps configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate when first email should be sent
    const nextSendAt = calculateNextSendTime(firstStep.delay_amount, firstStep.delay_unit);

    // Create or reactivate enrollment
    let enrollmentId: string;

    if (existing) {
      // Reactivate existing enrollment
      const { data, error } = await supabase
        .from('email_sequence_enrollments')
        .update({
          status: 'active',
          current_step: 1,
          next_send_at: nextSendAt,
          enrolled_at: new Date().toISOString(),
          unenrolled_at: null,
          unenrolled_reason: null,
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      enrollmentId = data.id;
    } else {
      // Create new enrollment
      const { data, error } = await supabase
        .from('email_sequence_enrollments')
        .insert({
          client_id,
          sequence_id,
          stylist_id,
          next_send_at: nextSendAt,
        })
        .select()
        .single();

      if (error) throw error;
      enrollmentId = data.id;
    }

    console.log(`✅ Successfully enrolled client. Enrollment ID: ${enrollmentId}`);

    return new Response(
      JSON.stringify({
        success: true,
        enrollment_id: enrollmentId,
        next_send_at: nextSendAt,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in enroll-in-sequence:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

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
      now.setDate(now.getDate() + (amount * 7));
      break;
    default:
      now.setDate(now.getDate() + amount);
  }
  
  return now.toISOString();
}

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authHeader = req.headers.get('Authorization')!;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { message, conversationHistory } = await req.json();
    
    // Get user info
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Authentication required');
    }

    // Fetch user context
    const context = await fetchUserContext(supabase, user.id);

    // Build system prompt with context
    const systemPrompt = buildSystemPrompt(context);

    // Call Lovable AI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []),
      { role: 'user', content: message }
    ];

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI service error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const response = aiData.choices[0]?.message?.content || 'I apologize, but I need more information to help you.';

    return new Response(
      JSON.stringify({ response }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Support chat error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        response: "I'm having trouble processing your request right now. Please try again or contact support directly."
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

async function fetchUserContext(supabase: any, userId: string) {
  try {
    // Fetch upcoming appointments
    const { data: appointments } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_date,
        status,
        service_type,
        notes,
        stylist_profiles (
          business_name
        )
      `)
      .or(`client_id.in.(select id from client_profiles where user_id='${userId}'),stylist_id.in.(select id from stylist_profiles where user_id='${userId}')`)
      .gte('appointment_date', new Date().toISOString())
      .order('appointment_date', { ascending: true })
      .limit(5);

    // Fetch services
    const { data: services } = await supabase
      .from('stylist_services')
      .select('service_name, description, price, duration_minutes')
      .eq('is_active', true)
      .limit(10);

    // Check if user is a stylist
    const { data: stylistProfile } = await supabase
      .from('stylist_profiles')
      .select('business_name, location, business_phone, business_email')
      .eq('user_id', userId)
      .maybeSingle();

    // Check if user is a client
    const { data: clientProfile } = await supabase
      .from('client_profiles')
      .select('full_name, preferred_stylist_id')
      .eq('user_id', userId)
      .maybeSingle();

    return {
      appointments: appointments || [],
      services: services || [],
      stylistProfile,
      clientProfile,
      userRole: stylistProfile ? 'stylist' : clientProfile ? 'client' : 'unknown'
    };
  } catch (error) {
    console.error('Error fetching context:', error);
    return {
      appointments: [],
      services: [],
      stylistProfile: null,
      clientProfile: null,
      userRole: 'unknown'
    };
  }
}

function buildSystemPrompt(context: any): string {
  const { appointments, services, stylistProfile, clientProfile, userRole } = context;

  let prompt = `You are a helpful AI support assistant for hA.I.r, a salon management platform. Be friendly, professional, and concise.

Your role is to help users with:
- Appointment booking and rescheduling questions
- Service information and pricing
- General platform questions
- Account inquiries

IMPORTANT RULES:
- Keep responses under 100 words
- Be conversational and warm
- If you don't know something, say so and suggest contacting human support
- Never make up information about appointments or services
`;

  if (userRole === 'client') {
    prompt += `\nUser is a CLIENT named ${clientProfile?.full_name || 'there'}.`;
  } else if (userRole === 'stylist') {
    prompt += `\nUser is a STYLIST with business: ${stylistProfile?.business_name || 'their salon'}.`;
  }

  if (appointments.length > 0) {
    prompt += `\n\nUpcoming Appointments:`;
    appointments.forEach((apt: any, idx: number) => {
      const date = new Date(apt.appointment_date);
      prompt += `\n${idx + 1}. ${apt.service_type || 'Service'} on ${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - Status: ${apt.status}`;
    });
  }

  if (services.length > 0) {
    prompt += `\n\nAvailable Services:`;
    services.forEach((svc: any, idx: number) => {
      prompt += `\n${idx + 1}. ${svc.service_name} - $${svc.price} (${svc.duration_minutes} min)${svc.description ? ` - ${svc.description}` : ''}`;
    });
  }

  if (stylistProfile) {
    prompt += `\n\nBusiness Info:`;
    if (stylistProfile.location) prompt += `\nLocation: ${stylistProfile.location}`;
    if (stylistProfile.business_phone) prompt += `\nPhone: ${stylistProfile.business_phone}`;
    if (stylistProfile.business_email) prompt += `\nEmail: ${stylistProfile.business_email}`;
  }

  return prompt;
}

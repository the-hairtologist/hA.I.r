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
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization')!;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false }
    });

    const { message } = await req.json();
    
    // Get user info
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Authentication required');
    }

    // Load conversation history from database
    const { data: conversation, error: convError } = await supabase
      .from('ai_conversations')
      .select('id, messages, context')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Fetch user context
    const context = await fetchUserContext(supabase, user.id);

    // Build system prompt with context
    const systemPrompt = buildSystemPrompt(context);

    // Build messages array with history
    const previousMessages = conversation?.messages || [];
    const messages = [
      { role: 'system', content: systemPrompt },
      ...previousMessages,
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

    // Save conversation to database
    const updatedMessages = [
      ...previousMessages,
      { role: 'user', content: message, timestamp: new Date().toISOString() },
      { role: 'assistant', content: response, timestamp: new Date().toISOString() }
    ];

    // Keep only last 20 messages to avoid token limits
    const trimmedMessages = updatedMessages.slice(-20);

    if (conversation) {
      await supabase
        .from('ai_conversations')
        .update({ 
          messages: trimmedMessages,
          context: context,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversation.id);
    } else {
      await supabase
        .from('ai_conversations')
        .insert({
          user_id: user.id,
          messages: trimmedMessages,
          context: context
        });
    }

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
    // Fetch client and stylist profile IDs first (prevents SQL injection)
    const { data: clientProfiles } = await supabase
      .from('client_profiles')
      .select('id')
      .eq('user_id', userId);

    const { data: stylistProfiles } = await supabase
      .from('stylist_profiles')
      .select('id')
      .eq('user_id', userId);

    const clientIds = clientProfiles?.map((p: any) => p.id) || [];
    const stylistIds = stylistProfiles?.map((p: any) => p.id) || [];

    // Fetch appointments using parameterized queries
    let appointments: any[] = [];

    // Build OR condition safely by fetching separately and merging
    if (clientIds.length > 0 || stylistIds.length > 0) {
      const promises = [];
      
      if (clientIds.length > 0) {
        promises.push(
          supabase
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
            .in('client_id', clientIds)
            .gte('appointment_date', new Date().toISOString())
            .order('appointment_date', { ascending: true })
            .limit(5)
        );
      }
      
      if (stylistIds.length > 0) {
        promises.push(
          supabase
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
            .in('stylist_id', stylistIds)
            .gte('appointment_date', new Date().toISOString())
            .order('appointment_date', { ascending: true })
            .limit(5)
        );
      }

      const results = await Promise.all(promises);
      const allAppointments = results
        .flatMap(result => result.data || [])
        .sort((a: any, b: any) => 
          new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime()
        )
        .slice(0, 5);

      appointments = allAppointments;
    }

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

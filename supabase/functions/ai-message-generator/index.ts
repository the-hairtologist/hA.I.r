import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const requestSchema = z.object({
  messageType: z.enum([
    'retention',
    'followup',
    'birthday',
    'reengagement',
    'appointment_reminder',
  ]),
  clientId: z.string().uuid(),
  clientProfile: z
    .object({
      full_name: z.string().max(255).optional(),
    })
    .passthrough(),
  stylistProfile: z
    .object({
      business_name: z.string().max(255).optional(),
      specialty: z.string().max(255).optional(),
    })
    .passthrough(),
  recentAppointments: z
    .array(
      z
        .object({
          appointment_date: z.string(),
          service_type: z.string().max(255).optional(),
        })
        .passthrough()
    )
    .max(50)
    .optional(),
  customContext: z.string().max(1000).optional(),
});

serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    // Validate input
    const validationResult = requestSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid input',
          details: validationResult.error.issues.map(i => i.message).join(', '),
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const {
      messageType,
      clientId,
      clientProfile,
      stylistProfile,
      recentAppointments,
      customContext,
    } = validationResult.data;

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing authorization header');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build context for AI
    const lastAppointment = recentAppointments?.[0];
    const daysSinceLastVisit = lastAppointment
      ? Math.floor(
          (Date.now() - new Date(lastAppointment.appointment_date).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : null;

    const messageTypePrompts: Record<string, string> = {
      retention: `Write a warm, personal retention message to re-engage a client who hasn't visited in ${daysSinceLastVisit} days. Make them feel missed, not pressured.`,
      followup: `Write a friendly follow-up message after their recent ${lastAppointment?.service_type} appointment. Thank them and provide care tips.`,
      birthday: `Write a heartfelt birthday message with a special offer. Make it feel genuinely personal, not automated.`,
      reengagement: `Write a re-engagement message for a client who's been inactive for ${daysSinceLastVisit} days. Show you care about their hair health.`,
      appointment_reminder: `Write a friendly appointment reminder for their upcoming ${lastAppointment?.service_type} appointment.`,
    };

    // AI message generation
    const aiResponse = await fetch(
      'https://ai.gateway.lovable.dev/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'system',
              content: `You are an expert salon communication AI. Write warm, personalized messages that:
- Feel genuine and human, never robotic
- Reference specific client history when relevant
- Match the stylist's tone and brand
- Include clear but soft calls-to-action
- Are concise (2-3 short paragraphs max for body)
- Use emojis sparingly and appropriately

Never use: generic templates, excessive exclamation marks, pushy sales language, or overly formal tone.`,
            },
            {
              role: 'user',
              content: `${messageTypePrompts[messageType] || messageTypePrompts.followup}

Client Context:
- Name: ${clientProfile?.full_name || 'Valued Client'}
- Last visit: ${lastAppointment?.appointment_date ? new Date(lastAppointment.appointment_date).toLocaleDateString() : 'Unknown'}
- Favorite services: ${
                recentAppointments
                  ?.map((a: any) => a.service_type)
                  .filter((v: any, i: number, a: any[]) => a.indexOf(v) === i)
                  .slice(0, 2)
                  .join(', ') || 'None yet'
              }
- Days since last visit: ${daysSinceLastVisit || 'Never visited'}

Stylist Context:
- Name: ${stylistProfile?.business_name || 'Your Stylist'}
- Specialty: ${stylistProfile?.specialty || 'Hair care'}

${customContext ? `Additional context: ${customContext}` : ''}

Generate a ${messageType} message.`,
            },
          ],
          tools: [
            {
              type: 'function',
              function: {
                name: 'generate_message',
                description: 'Generate personalized client message',
                parameters: {
                  type: 'object',
                  properties: {
                    subject: {
                      type: 'string',
                      maxLength: 60,
                      description: 'Email subject line (engaging and personal)',
                    },
                    body: {
                      type: 'string',
                      maxLength: 600,
                      description: 'Message body (2-3 short paragraphs)',
                    },
                    call_to_action: {
                      type: 'string',
                      maxLength: 100,
                      description: 'Clear next step for the client',
                    },
                    tone: {
                      type: 'string',
                      enum: ['warm', 'professional', 'casual', 'enthusiastic'],
                      description: 'Detected tone of the message',
                    },
                    suggested_send_time: {
                      type: 'string',
                      description:
                        "Best time to send (e.g., 'Tuesday morning', 'Weekend afternoon')",
                    },
                  },
                  required: ['subject', 'body', 'call_to_action', 'tone'],
                },
              },
            },
          ],
          tool_choice: {
            type: 'function',
            function: { name: 'generate_message' },
          },
        }),
      }
    );

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI message generation failed:', errorText);

      // Fallback to basic template
      return new Response(
        JSON.stringify({
          subject: `Hi ${clientProfile?.full_name || 'there'}! 💇‍♀️`,
          body: `It's been a while since we've seen you! We'd love to help you look and feel your best again. Ready to book your next appointment?`,
          call_to_action: 'Book your appointment today',
          tone: 'warm',
          fallback: true,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      throw new Error('No message generated from AI');
    }

    const message = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(message), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-message-generator:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

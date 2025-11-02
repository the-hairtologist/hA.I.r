import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const requestSchema = z.object({
  videoBase64: z.string().min(100),
  serviceType: z.string().optional(),
  additionalNotes: z.string().max(500).optional(),
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

    const { videoBase64, serviceType, additionalNotes } = validationResult.data;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Analyzing hair video...');

    const systemPrompt = `You are an expert hair analyst. Analyze the provided video of hair and provide a comprehensive assessment.`;

    const userPrompt = `Analyze this hair video and provide detailed insights.
${serviceType ? `Service type requested: ${serviceType}` : ''}
${additionalNotes ? `Additional notes: ${additionalNotes}` : ''}

Provide a thorough analysis focusing on:
1. Hair texture (straight, wavy, curly, coily)
2. Hair movement and flow
3. Overall condition (healthy, dry, damaged)
4. Damage level assessment
5. Specific recommendations for the requested service`;

    const response = await fetch(
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
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: userPrompt,
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: videoBase64,
                  },
                },
              ],
            },
          ],
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'video_analysis',
              strict: true,
              schema: {
                type: 'object',
                properties: {
                  texture: {
                    type: 'string',
                    enum: ['straight', 'wavy', 'curly', 'coily', 'mixed'],
                  },
                  movement: { type: 'string' },
                  condition: { type: 'string' },
                  damage_level: {
                    type: 'string',
                    enum: ['minimal', 'moderate', 'severe'],
                  },
                  recommendations: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                  detailed_notes: { type: 'string' },
                },
                required: [
                  'texture',
                  'movement',
                  'condition',
                  'damage_level',
                  'recommendations',
                ],
                additionalProperties: false,
              },
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            error: 'Rate limit exceeded. Please try again in a moment.',
          }),
          {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            error: 'AI usage limit reached. Please add credits to continue.',
          }),
          {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Video analysis completed');

    const aiContent = data.choices[0].message.content;
    const analysis = JSON.parse(aiContent);

    return new Response(JSON.stringify({ analysis }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in analyze-hair-video function:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'An unexpected error occurred',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

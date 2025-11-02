import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const requestSchema = z.object({
  stylistId: z.string().uuid(),
  clientId: z.string().uuid().optional(),
  timeRange: z.string().max(50).optional(),
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

    const { stylistId, clientId, timeRange } = validationResult.data;

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get(
      'SUPABASE_SERVICE_ROLE_KEY'
    )!;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch historical appointment data
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('stylist_id', stylistId)
      .order('appointment_date', { ascending: false })
      .limit(50);

    if (error) throw error;

    // Analyze patterns
    const dayCount: Record<number, number> = {};
    const hourCount: Record<number, number> = {};
    const serviceCount: Record<string, number> = {};

    appointments?.forEach(apt => {
      const date = new Date(apt.appointment_date);
      const day = date.getDay();
      const hour = date.getHours();

      dayCount[day] = (dayCount[day] || 0) + 1;
      hourCount[hour] = (hourCount[hour] || 0) + 1;
      serviceCount[apt.service_type] =
        (serviceCount[apt.service_type] || 0) + 1;
    });

    // Build AI prompt
    const systemPrompt = `You are a scheduling optimization AI for hair stylists.

APPOINTMENT PATTERNS:
- Day distribution: ${JSON.stringify(dayCount)}
- Hour distribution: ${JSON.stringify(hourCount)}
- Service types: ${JSON.stringify(serviceCount)}
- Total appointments: ${appointments?.length || 0}

TASK: Suggest optimal appointment times for the next ${timeRange || '7 days'}.

Consider:
- Busiest days/times (suggest gaps or extensions)
- Service type patterns
- Work-life balance
- Client preferences

OUTPUT: 3-5 specific time slots with brief reasoning (JSON format):
[
  {
    "datetime": "ISO datetime string",
    "reason": "Why this time works (10 words)",
    "confidence": "high|medium|low"
  }
]`;

    if (LOVABLE_API_KEY) {
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
              { role: 'system', content: systemPrompt },
              {
                role: 'user',
                content: 'Generate smart scheduling suggestions.',
              },
            ],
            max_tokens: 400,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const aiResponse = data.choices[0].message.content;

        try {
          const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
          const suggestions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

          return new Response(
            JSON.stringify({
              suggestions,
              patterns: { dayCount, hourCount, serviceCount },
            }),
            {
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        } catch (e) {
          console.error('Failed to parse AI response:', e);
        }
      }
    }

    // Fallback: Rule-based suggestions
    const fallbackSuggestions = [];
    const now = new Date();

    // Find most popular day and time
    const popularDay = Object.entries(dayCount).sort(
      (a, b) => (b[1] as number) - (a[1] as number)
    )[0]?.[0];
    const popularHour = Object.entries(hourCount).sort(
      (a, b) => (b[1] as number) - (a[1] as number)
    )[0]?.[0];

    if (popularDay && popularHour) {
      for (let i = 1; i <= 3; i++) {
        const suggestedDate = new Date(now);
        suggestedDate.setDate(now.getDate() + i * 7);
        suggestedDate.setHours(parseInt(popularHour), 0, 0, 0);

        fallbackSuggestions.push({
          datetime: suggestedDate.toISOString(),
          reason: 'Matches your busiest time pattern',
          confidence: 'medium',
        });
      }
    }

    return new Response(
      JSON.stringify({
        suggestions: fallbackSuggestions,
        patterns: { dayCount, hourCount, serviceCount },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in smart-scheduling-suggestions:', error);
    return new Response(
      JSON.stringify({ error: error.message, suggestions: [] }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

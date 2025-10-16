import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      currentTrigger, 
      stats,
      engagementMetrics = {}
    } = await req.json();

    if (!currentTrigger) {
      throw new Error('currentTrigger is required');
    }

    // Call Lovable AI for optimization
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are a subscription conversion optimization AI. Your job is to:
1. Analyze user engagement patterns
2. Predict optimal timing for subscription nudges
3. Generate personalized, non-pushy messaging
4. Estimate conversion probability

Consider psychological principles:
- Reciprocity (user has received value)
- Momentum (user is actively using the app)
- Urgency (without being aggressive)
- Value demonstration (show tangible benefits)`;

    const userContext = {
      currentTrigger,
      stats: stats || {},
      engagementMetrics,
      timestamp: new Date().toISOString()
    };

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `Optimize subscription nudge for this context:\n${JSON.stringify(userContext, null, 2)}\n\nShould we show a nudge now? If yes, provide personalized messaging.`
          }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'optimize_nudge',
            description: 'Determine if and how to show subscription nudge',
            parameters: {
              type: 'object',
              properties: {
                shouldShow: {
                  type: 'boolean',
                  description: 'Whether to show nudge at this moment'
                },
                timing: {
                  type: 'string',
                  enum: ['now', 'delay_1h', 'delay_24h', 'delay_3d'],
                  description: 'Optimal timing for the nudge'
                },
                personalizedMessage: {
                  type: 'string',
                  description: 'Personalized, friendly message highlighting value received'
                },
                emphasize: {
                  type: 'string',
                  enum: ['value', 'urgency', 'social_proof', 'features'],
                  description: 'What to emphasize in the nudge'
                },
                conversionProbability: {
                  type: 'number',
                  description: 'Estimated conversion probability 0-100'
                },
                reasoning: {
                  type: 'string',
                  description: 'Brief explanation of the recommendation'
                }
              },
              required: ['shouldShow', 'timing', 'conversionProbability', 'reasoning']
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'optimize_nudge' } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      // Fallback to showing nudge with default timing
      return new Response(JSON.stringify({
        shouldShow: true,
        timing: 'now',
        personalizedMessage: null,
        emphasize: 'value',
        conversionProbability: 50,
        reasoning: 'Fallback recommendation',
        fallback: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiData = await aiResponse.json();
    console.log('AI response:', aiData);

    // Extract tool call result
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const optimization = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({
      ...optimization,
      fallback: false
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-nudge-optimizer:', error);
    
    // Return safe fallback
    return new Response(JSON.stringify({
      shouldShow: true,
      timing: 'now',
      personalizedMessage: null,
      emphasize: 'value',
      conversionProbability: 50,
      reasoning: error.message,
      fallback: true
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

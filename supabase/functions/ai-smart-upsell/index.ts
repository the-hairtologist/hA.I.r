import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting
const rateLimiter = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 30;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const limit = rateLimiter.get(userId);
  
  if (!limit || now > limit.resetAt) {
    rateLimiter.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (limit.count >= MAX_REQUESTS) {
    return false;
  }
  
  limit.count++;
  return true;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limit check
    const authHeader = req.headers.get('authorization');
    const userId = authHeader?.split('Bearer ')[1]?.substring(0, 20) || 'anonymous';
    
    if (!checkRateLimit(userId)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please wait 60 seconds.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const {
      currentService, 
      clientHistory = [], 
      clientProfile = null,
      availableServices = []
    } = await req.json();

    if (!currentService) {
      throw new Error('currentService is required');
    }

    // Determine current season
    const month = new Date().getMonth();
    const season = month >= 2 && month <= 4 ? 'spring' :
                   month >= 5 && month <= 7 ? 'summer' :
                   month >= 8 && month <= 10 ? 'fall' : 'winter';

    // Call Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are a salon revenue optimization AI expert. Your job is to suggest relevant upsell services that:
1. Complement the current service naturally
2. Address client's hair goals and concerns
3. Consider seasonal trends (e.g., color protection in summer, hydration in winter)
4. Are based on client history patterns
5. Feel personalized, not pushy

Provide one highly relevant upsell suggestion with clear reasoning.`;

    const userContext = {
      currentService,
      clientHistory,
      clientProfile,
      availableServices,
      season,
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
          { role: 'user', content: `Suggest an upsell for this context:\n${JSON.stringify(userContext, null, 2)}` }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'suggest_upsell',
            description: 'Suggest a relevant upsell service with reasoning',
            parameters: {
              type: 'object',
              properties: {
                addon: { 
                  type: 'string',
                  description: 'Name of the suggested add-on service'
                },
                reasoning: { 
                  type: 'string',
                  description: 'Clear, client-friendly explanation of why this upsell makes sense'
                },
                incomeBoost: { 
                  type: 'number',
                  description: 'Estimated percentage income boost (10-50)'
                },
                confidence: { 
                  type: 'number',
                  description: 'Confidence score 0-100 based on context quality'
                }
              },
              required: ['addon', 'reasoning', 'incomeBoost', 'confidence']
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'suggest_upsell' } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      // Fallback to basic suggestion if AI fails
      return new Response(JSON.stringify({
        addon: 'Deep Conditioning Treatment',
        reasoning: 'Professional treatment to maintain hair health',
        incomeBoost: 20,
        confidence: 50,
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

    const suggestion = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({
      ...suggestion,
      fallback: false
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-smart-upsell:', error);
    
    // Always return a fallback suggestion instead of error
    return new Response(JSON.stringify({
      addon: 'Professional Treatment',
      reasoning: 'Enhance your service with a professional treatment',
      incomeBoost: 20,
      confidence: 50,
      fallback: true,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 200, // Return 200 with fallback, not error
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

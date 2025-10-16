import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data, messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let body: any = {};

    switch (type) {
      case "smart-scheduling":
        systemPrompt = `You are an AI scheduling assistant for hair salons. Analyze the stylist's calendar, client preferences, and service durations to suggest optimal appointment times. Consider factors like:
- Peak hours and quiet periods
- Client travel time and preferences
- Service duration and buffer times
- Back-to-back appointment optimization
- Break times and lunch periods

Provide actionable, specific scheduling recommendations.`;
        
        body = {
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages
          ],
          stream: false
        };
        break;

      case "formula-recommendation":
        systemPrompt = `You are a cautious, professional hair-color assistant for licensed stylists.

Client Profile Context:
- Natural level: ${data?.natural_level || "not specified"}
- Current color: ${data?.current_color || "not specified"}  
- Hair history: ${data?.hair_history || "not specified"}
- Porosity: ${data?.porosity || "medium"}
- Texture: ${data?.texture || "medium"}
- Gray %: ${data?.gray_percent || 0}%
- Sensitivity: ${data?.sensitivity || "none"}

Goal:
- Target look: ${data?.target_look || "not specified"}
- Time available (min): ${data?.time_minutes || "not specified"}
- Budget band: ${data?.budget_band || "moderate"}

Output STRICT JSON with this schema:
{
  "ready": true/false,
  "missing_inputs": ["list missing critical fields"],
  "formula": {
    "base": [{"brand":"", "shade":"", "ratio":"", "developer":"", "processing_minutes":0}],
    "lighten": [{"product":"", "developer":"", "mix":"", "processing_minutes":0}],
    "tone": [{"brand":"", "shade":"", "ratio":"", "processing_minutes":0}]
  },
  "application_steps": ["step 1", "step 2", "..."],
  "aftercare": ["tip 1", "tip 2"],
  "cautions": ["ends are porous - watch closely", "..."],
  "estimated_time_minutes": 0,
  "disclaimer": "Recommendations are guidance for licensed professionals; verify strand tests."
}

RULES:
- If natural_level, current_color, or target_look missing → set ready=false, list them
- Use common, realistic products and times
- If hair is compromised → suggest gentler approach
- Return ONLY JSON, no extra text`
        
        body = {
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages
          ],
          response_format: { type: "json_object" },
          stream: false
        };
        break;

      case "client-insights":
        systemPrompt = `You are an AI analyst for salon client relationships. Analyze client data to provide insights on:
- Visit frequency patterns and trends
- Service preferences and evolution
- Spending patterns
- Satisfaction indicators
- Rebooking likelihood
- Personalized engagement recommendations

Provide actionable insights to improve client retention and satisfaction.`;
        
        body = {
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Analyze this client data: ${JSON.stringify(data)}` }
          ],
          stream: false
        };
        break;

      case "automated-followup":
        systemPrompt = `You are an AI assistant that drafts personalized follow-up messages for salon clients. Create warm, professional messages that:
- Reference specific services from their last visit
- Show genuine care and interest
- Include relevant tips for their hair care
- Encourage rebooking naturally
- Match the salon's tone and style

Keep messages concise, personal, and engaging.`;
        
        body = {
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Draft a follow-up message for: ${JSON.stringify(data)}` }
          ],
          stream: false
        };
        break;

      case "chat":
        systemPrompt = `You are a helpful AI assistant for hair salon professionals. You help stylists with:

**For Color Formulas:**
- Analyze hair level, current color, and desired result
- Suggest specific products with ratios (e.g., "2oz Wella 8N + 1oz 8A + 4oz 20vol")
- Provide processing times and application steps
- Include strand test warnings for major changes
- Add aftercare recommendations

**For Color Corrections:**
- Identify the problem (brassy, uneven, too dark/light)
- Suggest gentle correction methods
- Warn about hair integrity
- Recommend multiple sessions if needed

**For Business Help:**
- Scheduling optimization
- Client communication templates  
- Pricing guidance
- Time management

**For Techniques:**
- Step-by-step application methods
- Tool recommendations
- Pro tips and troubleshooting

**Safety First:**
- Always recommend strand tests for new formulas
- Warn about over-processing risks
- Consider hair history and condition
- Remind: "These are professional recommendations - always verify with strand tests"

Be specific, actionable, and conversational. When giving formulas, use realistic brands (Wella, Redken, Schwarzkopf, Matrix, etc.).`;
        
        body = {
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages
          ],
          stream: false
        };
        break;

      case "correction-formula":
        systemPrompt = `You are a color correction specialist AI for licensed stylists.

Current Situation:
- Hair problem: ${data?.problem || "not specified"}
- Current color/level: ${data?.current_state || "not specified"}
- Previous services: ${data?.history || "none"}
- Hair condition: ${data?.condition || "healthy"}
- Desired outcome: ${data?.goal || "not specified"}

Output STRICT JSON:
{
  "diagnosis": "brief problem summary",
  "approach": "correction strategy (gentle/aggressive/multi-session)",
  "steps": [
    {
      "session": 1,
      "formula": [{"product":"", "mix":"", "processing_minutes":0}],
      "instructions": ["step by step"],
      "expected_result": "what to expect"
    }
  ],
  "cautions": ["over-processed areas", "watch timing carefully"],
  "strand_test_critical": true/false,
  "aftercare": ["protein treatment", "..."],
  "disclaimer": "Color corrections are complex - perform strand tests and assess hair integrity throughout."
}

RULES:
- Multi-session corrections safer than single aggressive treatments
- Always mention strand testing
- Consider hair health first, speed second
- Be realistic about achievable results`
        
        body = {
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages
          ],
          response_format: { type: "json_object" },
          stream: false
        };
        break;

      default:
        throw new Error(`Unknown AI feature type: ${type}`);
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: "Rate limit exceeded. Please try again in a moment." 
          }), 
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: "AI credits exhausted. Please add credits to continue." 
          }), 
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices[0].message.content;

    // Log structured outputs for debugging (formula types only)
    if (type === "formula-recommendation" || type === "correction-formula") {
      try {
        const parsed = JSON.parse(content);
        console.log(`${type} response structure:`, {
          ready: parsed.ready,
          has_formula: !!parsed.formula,
          has_steps: !!parsed.steps,
          cautions_count: parsed.cautions?.length || 0
        });
      } catch (e) {
        console.warn(`${type} did not return valid JSON:`, content.substring(0, 100));
      }
    }

    return new Response(
      JSON.stringify({ response: content }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("AI assistant error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

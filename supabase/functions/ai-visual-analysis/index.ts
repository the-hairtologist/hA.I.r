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
    const { photoUrl, clientId, context } = await req.json();

    if (!photoUrl || !clientId) {
      throw new Error("photoUrl and clientId are required");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro", // Best accuracy for critical hair analysis
        messages: [
          {
            role: "system",
            content: "You are a professional hair analysis AI trained to assess hair condition, color, texture, and health from photos."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this hair photo: condition (1-10), damage level, color fade %, texture, porosity, recommendations. Context: ${context || 'General'}`
              },
              { type: "image_url", image_url: { url: photoUrl } }
            ]
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "analyze_hair",
            parameters: {
              type: "object",
              properties: {
                condition_score: { type: "integer", minimum: 1, maximum: 10 },
                damage_level: { type: "string", enum: ["minimal", "moderate", "severe"] },
                color_fade_percentage: { type: "integer", minimum: 0, maximum: 100 },
                texture: { type: "string", enum: ["fine", "medium", "coarse"] },
                porosity: { type: "string", enum: ["low", "normal", "high"] },
                recommendations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      category: { type: "string" },
                      recommendation: { type: "string" },
                      priority: { type: "string" }
                    }
                  }
                }
              },
              required: ["condition_score", "damage_level", "texture", "porosity", "recommendations"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "analyze_hair" } }
      }),
    });

    if (!aiResponse.ok) {
      throw new Error("AI analysis failed");
    }

    const aiData = await aiResponse.json();
    const analysis = JSON.parse(aiData.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments || "{}");

    // Add confidence scoring and metadata
    const confidence = calculateConfidence(analysis);
    
    return new Response(
      JSON.stringify({ 
        ...analysis, 
        client_id: clientId,
        confidence_score: confidence,
        needs_review: confidence < 0.7,
        model_used: "google/gemini-2.5-pro"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Confidence calculation based on analysis completeness
function calculateConfidence(analysis: any): number {
  let score = 0;
  const checks = [
    analysis.condition_score > 0,
    analysis.damage_level,
    analysis.texture,
    analysis.porosity,
    analysis.recommendations?.length > 0
  ];
  
  score = checks.filter(Boolean).length / checks.length;
  return Math.round(score * 100) / 100; // Round to 2 decimals
}

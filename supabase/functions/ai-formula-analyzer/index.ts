import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const formulaSchema = z.object({
  id: z.string().uuid().optional(),
  formula_name: z.string().max(255),
  color_line: z.string().max(255).optional(),
  steps: z.array(z.any()).max(50),
  notes: z.string().max(1000).optional(),
}).passthrough();

const requestSchema = z.object({
  formulas: z.array(formulaSchema).min(1).max(20)
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Validate input
    const validationResult = requestSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: "Invalid input",
          details: validationResult.error.issues.map(i => i.message).join(", ")
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    const { formulas } = validationResult.data;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    console.log(`Analyzing ${formulas?.length || 0} formulas...`);

    // Analyze each formula with AI
    for (const formula of formulas || []) {
      try {
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-pro", // Critical formula analysis requires best accuracy
            messages: [
              {
                role: "system",
                content: `You are a hair formula analysis AI. Analyze formula success patterns, identify issues, and provide recommendations.
                
Consider:
- Color accuracy and consistency
- Processing time effectiveness
- Damage prevention
- Client satisfaction indicators
- Ingredient combinations that work well together`
              },
              {
                role: "user",
                content: `Analyze this hair formula:

Formula Name: ${formula.formula_name}
Color Line: ${formula.color_line}
Steps: ${JSON.stringify(formula.steps)}
Notes: ${formula.notes || 'None'}

Provide:
1. Success score (0.00 to 1.00)
2. Key insights about what makes this formula effective or problematic
3. Specific recommendations for improvement
4. Pattern analysis (common techniques, timing, etc.)`
              }
            ],
            tools: [{
              type: "function",
              function: {
                name: "analyze_formula",
                description: "Return formula analysis with success metrics",
                parameters: {
                  type: "object",
                  properties: {
                    success_score: {
                      type: "number",
                      minimum: 0,
                      maximum: 1,
                      description: "Overall success rating 0.00 to 1.00"
                    },
                    insights: {
                      type: "object",
                      properties: {
                        strengths: { type: "array", items: { type: "string" } },
                        weaknesses: { type: "array", items: { type: "string" } },
                        risk_factors: { type: "array", items: { type: "string" } }
                      }
                    },
                    recommendations: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          priority: { type: "string", enum: ["high", "medium", "low"] },
                          suggestion: { type: "string" },
                          expected_improvement: { type: "string" }
                        }
                      }
                    },
                    pattern_analysis: {
                      type: "object",
                      properties: {
                        processing_time_optimal: { type: "boolean" },
                        color_combination_effective: { type: "boolean" },
                        damage_prevention_adequate: { type: "boolean" }
                      }
                    }
                  },
                  required: ["success_score", "insights", "recommendations", "pattern_analysis"]
                }
              }
            }],
            tool_choice: { type: "function", function: { name: "analyze_formula" } }
          }),
        });

        if (!aiResponse.ok) {
          console.error(`AI analysis failed for formula ${formula.id}`);
          continue;
        }

        const aiData = await aiResponse.json();
        const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
        
        if (!toolCall) {
          console.error(`No tool call in response for formula ${formula.id}`);
          continue;
        }

        const analysis = JSON.parse(toolCall.function.arguments);
        
        // Add confidence and quality metrics
        const confidence = analysis.success_score || 0.5;
        const needsReview = confidence < 0.7 || analysis.insights?.risk_factors?.length > 2;

        // Store intelligence for later (client will save to database)
        formula.intelligence = {
          ...analysis,
          confidence_score: confidence,
          needs_review: needsReview,
          model_used: 'google/gemini-2.5-pro'
        };
      } catch (err) {
        console.error(`Error analyzing formula ${formula.id}:`, err);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        analyzed: formulas.length,
        formulas: formulas,
        message: "Formula intelligence analysis complete" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in ai-formula-analyzer:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

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
    const { clientId, appointments, clientProfile } = await req.json();

    if (!clientId || !appointments || !clientProfile) {
      throw new Error("clientId, appointments, and clientProfile are required");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // AI prediction
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a scheduling optimization AI. Predict optimal appointment times based on:
- Historical appointment patterns
- Seasonal variations
- Service type frequency (color needs refreshing more often than cuts)
- Client life patterns (detected from appointment timing)

Current date: ${new Date().toISOString()}`
          },
          {
            role: "user",
            content: `Predict next optimal appointment time for this client:

Client: ${clientProfile.full_name}
Preferred time of day: ${clientProfile.preferred_time_of_day || 'Not specified'}
Appointment history (last 20):
${JSON.stringify(appointments?.map(a => ({
  date: a.appointment_date,
  service: a.service_type,
  status: a.status
})), null, 2)}

Consider:
- Average time between appointments for each service type
- Day of week preferences
- Seasonal patterns
- Current season and upcoming holidays`
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "predict_next_appointment",
            description: "Predict optimal next appointment timing",
            parameters: {
              type: "object",
              properties: {
                suggested_date: {
                  type: "string",
                  format: "date",
                  description: "Recommended appointment date YYYY-MM-DD"
                },
                suggested_time: {
                  type: "string",
                  description: "Recommended time HH:MM (24hr)"
                },
                confidence: {
                  type: "number",
                  minimum: 0,
                  maximum: 100,
                  description: "Confidence level 0-100"
                },
                reasoning: {
                  type: "string",
                  description: "Explanation of why this timing is optimal"
                },
                alternative_dates: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      date: { type: "string", format: "date" },
                      reason: { type: "string" }
                    }
                  },
                  maxItems: 3
                }
              },
              required: ["suggested_date", "suggested_time", "confidence", "reasoning"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "predict_next_appointment" } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI prediction failed:", errorText);
      
      // Fallback to basic calculation
      const lastAppt = appointments?.[0];
      const avgDaysBetween = 42; // 6 weeks default
      const nextDate = new Date(lastAppt?.appointment_date || Date.now());
      nextDate.setDate(nextDate.getDate() + avgDaysBetween);

      return new Response(
        JSON.stringify({
          suggested_date: nextDate.toISOString().split('T')[0],
          suggested_time: "10:00",
          confidence: 50,
          reasoning: "Based on standard 6-week interval (AI unavailable)",
          fallback: true
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("No prediction returned from AI");
    }

    const prediction = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify(prediction),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in ai-schedule-predictor:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

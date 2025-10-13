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
        systemPrompt = `You are an expert hair colorist AI assistant. Help stylists create perfect color formulas by:
- Analyzing client hair history and previous formulas
- Considering hair type, texture, and condition
- Suggesting precise color mixing ratios
- Recommending processing times
- Providing maintenance tips
- Warning about potential issues

Be specific with product names, ratios, and techniques.`;
        
        body = {
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages
          ],
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
        systemPrompt = `You are a helpful AI assistant for hair salon management. Help stylists with:
- Scheduling and time management
- Color formula recommendations
- Client communication
- Business insights
- Hair care advice
- Booking optimization

Be concise, practical, and actionable in your responses.`;
        
        body = {
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages
          ],
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

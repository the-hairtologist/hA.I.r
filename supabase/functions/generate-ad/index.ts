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
    const { prompt, adType, generateImage } = await req.json();
    
    // Input validation
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      throw new Error("Prompt is required and must be a non-empty string");
    }
    
    if (prompt.length > 1000) {
      throw new Error("Prompt must be less than 1000 characters");
    }
    
    const validAdTypes = ['social-media', 'landing-page', 'email', 'banner'];
    if (!validAdTypes.includes(adType)) {
      throw new Error("Invalid ad type");
    }
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating ad:", { prompt: prompt.substring(0, 50) + "...", adType, generateImage });

    const results: any = {};

    // Generate ad copy first
    const copyPrompt = `Create compelling ad copy for a hair salon app called "hA.I.r". 
Context: ${prompt}
Ad Type: ${adType}

Generate:
1. A catchy headline (max 60 chars)
2. Primary text/body copy (max 125 chars for social media)
3. Call-to-action text (max 20 chars)

Format as JSON: { "headline": "...", "bodyCopy": "...", "cta": "..." }`;

    const copyResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an expert copywriter for beauty and hair salon businesses. Always respond with valid JSON." },
          { role: "user", content: copyPrompt }
        ],
      }),
    });

    if (!copyResponse.ok) {
      const errorText = await copyResponse.text();
      console.error("Copy generation error:", errorText);
      throw new Error(`Failed to generate ad copy: ${copyResponse.status}`);
    }

    const copyData = await copyResponse.json();
    const copyContent = copyData.choices?.[0]?.message?.content;
    
    try {
      results.copy = JSON.parse(copyContent);
    } catch (e) {
      console.error("Failed to parse copy JSON:", copyContent);
      results.copy = {
        headline: "Transform Your Look",
        bodyCopy: "Book with top stylists. AI-powered matching. Perfect results every time.",
        cta: "Book Now"
      };
    }

    console.log("Generated copy:", results.copy);

    // Generate image if requested
    if (generateImage) {
      const imagePrompt = `Create a professional, eye-catching advertisement image for a hair salon app. 
Style: Modern, clean, vibrant
Subject: ${prompt}
Include: Beautiful hair styling, professional salon atmosphere, diverse representation
Aspect ratio: Square (1:1) for social media
Do not include text in the image.`;

      const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image-preview",
          messages: [
            { role: "user", content: imagePrompt }
          ],
          modalities: ["image", "text"]
        }),
      });

      if (!imageResponse.ok) {
        const errorText = await imageResponse.text();
        console.error("Image generation error:", errorText);
        throw new Error(`Failed to generate image: ${imageResponse.status}`);
      }

      const imageData = await imageResponse.json();
      const imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      
      if (imageUrl) {
        results.image = imageUrl;
        console.log("Generated image successfully");
      } else {
        console.error("No image in response:", imageData);
      }
    }

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-ad:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

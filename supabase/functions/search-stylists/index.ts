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
    const { location, specialty, colorLine } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build search queries for different sources
    const queries = [
      `${colorLine || 'professional'} certified hair colorist ${specialty || ''} ${location || 'near me'}`,
      `hair stylist ${specialty || 'color specialist'} ${location || ''} portfolio instagram`,
      `top rated hair salon colorist ${location || ''} reviews`,
    ];

    console.log('Searching for stylists with queries:', queries);

    // Perform web searches using Lovable AI
    const searchResults = await Promise.all(
      queries.map(async (query) => {
        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              {
                role: 'system',
                content: `You are a stylist discovery assistant. Search the web and extract information about professional hair stylists/colorists. 
                
Return results as a JSON array with this structure:
[
  {
    "name": "Stylist full name",
    "businessName": "Salon or business name",
    "location": "City, State",
    "specialty": "Main specialty (e.g., balayage, color correction)",
    "certifications": ["Brand certifications or training"],
    "rating": "Average rating if available",
    "reviewCount": "Number of reviews",
    "portfolio": "Instagram handle or portfolio URL",
    "contact": "Phone or email if available",
    "bio": "Brief 1-2 sentence bio",
    "source": "Where this info was found (e.g., Wella Pro Network, Instagram, Yelp)"
  }
]

Focus on verified professionals with portfolios. Include 3-5 top results.`
              },
              {
                role: 'user',
                content: query
              }
            ],
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          console.error('AI Gateway error:', response.status);
          return [];
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        
        // Try to parse JSON from the response
        try {
          const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\[([\s\S]*)\]/);
          const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
          return JSON.parse(jsonString);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          return [];
        }
      })
    );

    // Flatten and deduplicate results
    const allResults = searchResults.flat();
    const uniqueResults = Array.from(
      new Map(allResults.map(item => [item.name + item.businessName, item])).values()
    );

    console.log(`Found ${uniqueResults.length} unique stylists`);

    return new Response(
      JSON.stringify({ stylists: uniqueResults }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error: any) {
    console.error('Error in search-stylists function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { stylistId } = await req.json();

    if (!stylistId) {
      throw new Error('Stylist ID is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Fetching portfolio photos for stylist:', stylistId);

    // Fetch all portfolio photos for the stylist
    const { data: photos, error: photosError } = await supabase
      .from('portfolio_photos')
      .select('*')
      .eq('stylist_id', stylistId)
      .order('display_order');

    if (photosError) throw photosError;

    if (!photos || photos.length === 0) {
      return new Response(
        JSON.stringify({
          error: 'No portfolio photos found',
          suggestions: [
            'Upload at least 3-5 photos to get meaningful insights',
            'Include before & after photos to showcase transformations',
            'Add captions to help AI understand your work',
          ],
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(
      `Analyzing ${photos.length} portfolio photos with Gemini 2.5 Pro...`
    );

    // Create a detailed prompt with portfolio context
    const portfolioSummary = photos
      .map((photo, idx) => {
        return `Photo ${idx + 1}:
- Type: ${photo.is_before_after ? 'Before & After' : 'Single Shot'}
- Caption: ${photo.caption || 'No caption'}
- URL: ${photo.photo_url}
${photo.before_photo_url ? `- Before URL: ${photo.before_photo_url}` : ''}`;
      })
      .join('\n\n');

    const systemPrompt = `You are an expert hair stylist portfolio analyst. Analyze the stylist's work and provide actionable insights.`;

    const userPrompt = `Analyze this hair stylist's portfolio with ${photos.length} photos:

${portfolioSummary}

Provide a comprehensive analysis including:

1. **Style Signature**: What are the recurring techniques, color palettes, or styles?
2. **Strengths**: What does this stylist excel at based on their portfolio?
3. **Portfolio Balance**: Is there good variety in services, styles, and techniques?
4. **Growth Opportunities**: What styles or techniques could expand their portfolio?
5. **Marketing Insights**: What are the most showcase-worthy pieces? What attracts clients?
6. **Before & After Impact**: If applicable, how effective are the transformations?

Be specific, actionable, and encouraging. Reference specific photos by number.`;

    // Build messages array with image URLs
    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [{ type: 'text', text: userPrompt }],
      },
    ];

    // Add up to 20 images (Gemini's reasonable limit for analysis)
    const imagesToAnalyze = photos.slice(0, 20);
    for (const photo of imagesToAnalyze) {
      messages[1].content.push({
        type: 'image_url',
        image_url: { url: photo.photo_url },
      });

      if (photo.before_photo_url) {
        messages[1].content.push({
          type: 'image_url',
          image_url: { url: photo.before_photo_url },
        });
      }
    }

    // Call Gemini 2.5 Pro with long context
    // Use Pro only for large portfolios (>20 images), Flash for most cases
    const modelToUse =
      messages.length > 25
        ? 'google/gemini-2.5-pro'
        : 'google/gemini-2.5-flash';

    const response = await fetch(
      'https://ai.gateway.lovable.dev/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelToUse, // Adaptive based on portfolio size
          messages,
          max_tokens: 2000,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            error: 'Rate limit exceeded. Please try again in a moment.',
          }),
          {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            error: 'AI usage limit reached. Please add credits to continue.',
          }),
          {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    console.log('Portfolio analysis completed successfully');

    return new Response(
      JSON.stringify({
        analysis,
        photosAnalyzed: imagesToAnalyze.length,
        totalPhotos: photos.length,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in analyze-portfolio function:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'An unexpected error occurred',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

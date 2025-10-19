import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔮 Generating predictive insights...');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    // Get all active stylists
    const { data: stylists, error: stylistError } = await supabase
      .from('stylist_profiles')
      .select('id, user_id')
      .eq('is_available', true);

    if (stylistError) throw stylistError;

    let generated = 0;
    const errors: string[] = [];

    for (const stylist of stylists || []) {
      try {
        // Gather stylist analytics data
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: recentAppointments } = await supabase
          .from('appointments')
          .select('*')
          .eq('stylist_id', stylist.id)
          .gte('appointment_date', thirtyDaysAgo.toISOString());

        const { data: clientRetention } = await supabase
          .from('appointments')
          .select('client_id')
          .eq('stylist_id', stylist.id)
          .gte('appointment_date', thirtyDaysAgo.toISOString());

        // Call AI to generate insights
        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
                content: 'You are a business intelligence AI for salon stylists. Analyze data and provide actionable insights to increase revenue and client satisfaction. Return only JSON.'
              },
              {
                role: 'user',
                content: `Analyze this stylist data and provide 2-3 high-priority actionable insights:
                
Recent Appointments: ${recentAppointments?.length || 0}
Unique Clients: ${new Set(clientRetention?.map(a => a.client_id)).size || 0}
Retention Rate: ${clientRetention ? ((new Set(clientRetention.map(a => a.client_id)).size / clientRetention.length) * 100).toFixed(0) : 0}%

Return JSON array with format:
[{
  "type": "revenue_opportunity|client_retention|scheduling_optimization",
  "title": "Short title (max 50 chars)",
  "description": "Clear actionable insight (max 150 chars)",
  "priority": "high|medium|low",
  "action_items": ["Action 1", "Action 2"],
  "potential_revenue": 0,
  "confidence_score": 0.0-1.0
}]`
              }
            ],
            temperature: 0.7,
            max_tokens: 1000
          }),
        });

        if (!aiResponse.ok) {
          throw new Error(`AI API error: ${aiResponse.status}`);
        }

        const aiData = await aiResponse.json();
        const insights = JSON.parse(aiData.choices[0].message.content);

        // Store insights in database
        for (const insight of insights) {
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 7); // Insights expire in 7 days

          await supabase.from('predictive_insights').insert({
            stylist_id: stylist.id,
            insight_type: insight.type,
            title: insight.title,
            description: insight.description,
            priority: insight.priority,
            action_items: insight.action_items,
            potential_revenue: insight.potential_revenue,
            confidence_score: insight.confidence_score,
            expires_at: expiresAt.toISOString(),
          });
        }

        generated += insights.length;
        console.log(`✅ Generated ${insights.length} insights for stylist ${stylist.id}`);
      } catch (insightError) {
        const msg = insightError instanceof Error ? insightError.message : 'Unknown error';
        errors.push(`Stylist ${stylist.id}: ${msg}`);
        console.error(`❌ Failed to generate insights for stylist ${stylist.id}:`, msg);
      }
    }

    return new Response(JSON.stringify({ 
      generated,
      stylists: stylists?.length || 0,
      errors: errors.length > 0 ? errors : undefined
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('❌ Error generating predictive insights:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

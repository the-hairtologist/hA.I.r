/**
 * AI Insights Generator
 * Proactively generates personalized insights for users
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAuth } from '../_shared/auth-middleware.ts';
import { checkRateLimit, createRateLimitResponse } from '../_shared/rate-limiter.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authResult = await requireAuth(req);
    if (authResult instanceof Response) {
      return authResult;
    }

    const { user, supabase } = authResult;

    // Check rate limit
    const rateLimit = await checkRateLimit(user.id, 'ai_insights', supabase);
    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit.resetAt);
    }

    const { type = 'daily_summary' } = await req.json();

    // Fetch user context
    const context = await fetchUserContext(supabase, user.id);

    // Generate insights using AI
    const insights = await generateInsights(context, type);

    // Store insights in database
    for (const insight of insights) {
      await supabase.from('ai_insights').insert({
        user_id: user.id,
        insight_type: insight.type,
        message: insight.message,
        action_url: insight.actionUrl,
        priority: insight.priority,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      });
    }

    return new Response(
      JSON.stringify({ insights }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Insights generation error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

async function fetchUserContext(supabase: any, userId: string) {
  // Check if user is stylist
  const { data: stylistProfile } = await supabase
    .from('stylist_profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (stylistProfile) {
    // Fetch stylist metrics
    const { data: appointments } = await supabase
      .from('appointments')
      .select('*')
      .eq('stylist_id', stylistProfile.id)
      .gte('appointment_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const { data: clients } = await supabase
      .from('client_profiles')
      .select('id, full_name')
      .eq('preferred_stylist_id', stylistProfile.id);

    return {
      userType: 'stylist',
      appointments: appointments || [],
      clients: clients || [],
    };
  }

  // Fetch client metrics
  const { data: clientProfile } = await supabase
    .from('client_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (clientProfile) {
    const { data: appointments } = await supabase
      .from('appointments')
      .select('*')
      .eq('client_id', clientProfile.id)
      .order('appointment_date', { ascending: false })
      .limit(10);

    return {
      userType: 'client',
      profile: clientProfile,
      appointments: appointments || [],
    };
  }

  return { userType: 'unknown' };
}

async function generateInsights(context: any, type: string) {
  const insights = [];

  if (context.userType === 'stylist') {
    // Stylist insights
    const { appointments, clients } = context;
    const thisWeek = appointments.filter((a: any) => 
      new Date(a.appointment_date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );

    if (thisWeek.length > 5) {
      insights.push({
        type: 'scheduling',
        message: `Busy week ahead! You have ${thisWeek.length} appointments. Consider blocking time for breaks.`,
        actionUrl: '/calendar',
        priority: 7
      });
    }

    // Check for clients who haven't booked recently
    const now = Date.now();
    const inactiveClients = clients.filter((c: any) => {
      const lastAppt = appointments
        .filter((a: any) => a.client_id === c.id)
        .sort((a: any, b: any) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime())[0];
      
      if (!lastAppt) return false;
      return now - new Date(lastAppt.appointment_date).getTime() > 60 * 24 * 60 * 60 * 1000; // 60 days
    });

    if (inactiveClients.length > 0) {
      insights.push({
        type: 'retention',
        message: `${inactiveClients.length} client${inactiveClients.length > 1 ? 's' : ''} haven't booked in 60+ days. Consider sending a follow-up.`,
        actionUrl: '/clients',
        priority: 8
      });
    }

    // Revenue insight
    const totalRevenue = appointments.reduce((sum: number, a: any) => sum + (a.total_price || 0), 0);
    if (totalRevenue > 0) {
      const avgPerAppt = totalRevenue / appointments.length;
      insights.push({
        type: 'revenue',
        message: `Your average appointment value is $${avgPerAppt.toFixed(2)}. Keep up the great work!`,
        actionUrl: '/dashboard',
        priority: 5
      });
    }

  } else if (context.userType === 'client') {
    // Client insights
    const { appointments, profile } = context;
    
    if (appointments.length > 0) {
      const lastAppt = appointments[0];
      const daysSince = Math.floor((Date.now() - new Date(lastAppt.appointment_date).getTime()) / (24 * 60 * 60 * 1000));
      
      if (daysSince > 42) { // 6 weeks
        insights.push({
          type: 'rebooking',
          message: `It's been ${Math.floor(daysSince / 7)} weeks since your last appointment. Time for a refresh?`,
          actionUrl: '/book-appointment',
          priority: 9
        });
      }
    }
  }

  return insights;
}

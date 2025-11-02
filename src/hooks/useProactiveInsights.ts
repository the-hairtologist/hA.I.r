/**
 * ✨ ENHANCEMENT: Proactive Insights Hook
 * Auto-generates business insights from data patterns
 * Runs in background, updates insights table automatically
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { differenceInDays, startOfWeek, endOfWeek } from 'date-fns';

interface ProactiveInsight {
  type: 'churn_risk' | 'revenue_opportunity' | 'efficiency' | 'retention';
  title: string;
  description: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  confidence: number;
  actionItems: Array<{ title: string; url?: string }>;
  potentialRevenue?: number;
}

export const useProactiveInsights = (stylistId?: string, enabled = true) => {
  const [insights, setInsights] = useState<ProactiveInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);

  useEffect(() => {
    if (!enabled || !stylistId) return;

    // Auto-generate insights daily
    const shouldGenerate =
      !lastGenerated || differenceInDays(new Date(), lastGenerated) >= 1;

    if (shouldGenerate) {
      generateInsights();
    }

    // Set up interval for daily generation
    const interval = setInterval(
      () => {
        generateInsights();
      },
      24 * 60 * 60 * 1000
    ); // 24 hours

    return () => clearInterval(interval);
  }, [stylistId, enabled, lastGenerated]);

  const generateInsights = async () => {
    if (!stylistId) return;

    setLoading(true);
    try {
      const newInsights: ProactiveInsight[] = [];

      // 1. ✨ Detect at-risk clients (churn prediction)
      const churnRisk = await detectChurnRisk(stylistId);
      if (churnRisk) newInsights.push(churnRisk);

      // 2. ✨ Identify revenue opportunities
      const revenueOpp = await detectRevenueOpportunities(stylistId);
      if (revenueOpp) newInsights.push(revenueOpp);

      // 3. ✨ Detect efficiency issues
      const efficiency = await detectEfficiencyIssues(stylistId);
      if (efficiency) newInsights.push(efficiency);

      // 4. ✨ Track retention wins
      const retention = await detectRetentionWins(stylistId);
      if (retention) newInsights.push(retention);

      setInsights(newInsights);
      setLastGenerated(new Date());

      // Auto-save insights to database
      if (newInsights.length > 0) {
        await saveInsightsToDatabase(stylistId, newInsights);
      }
    } catch (error) {
      console.error('Error generating proactive insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const detectChurnRisk = async (
    stylistId: string
  ): Promise<ProactiveInsight | null> => {
    const { data: clients } = await supabase
      .from('client_retention_scores')
      .select('*, client:client_profiles(user:profiles(full_name))')
      .eq('stylist_id', stylistId)
      .lte('retention_score', 40)
      .order('retention_score', { ascending: true })
      .limit(5);

    if (!clients || clients.length === 0) return null;

    const atRiskNames = clients
      .map(c => c.client?.user?.full_name || 'Unknown')
      .slice(0, 3)
      .join(', ');

    return {
      type: 'churn_risk',
      title: `${clients.length} Clients at Risk of Churn`,
      description: `Clients like ${atRiskNames} haven't visited recently. Send personalized messages now to re-engage.`,
      priority: 'urgent',
      confidence: 85,
      actionItems: [
        { title: 'View at-risk clients', url: '/clients?filter=at-risk' },
        { title: 'Send win-back messages', url: '/messages?template=winback' },
      ],
      potentialRevenue: clients.length * 150, // Avg appointment value
    };
  };

  const detectRevenueOpportunities = async (
    stylistId: string
  ): Promise<ProactiveInsight | null> => {
    const thisWeek = {
      start: startOfWeek(new Date()),
      end: endOfWeek(new Date()),
    };

    const { data: thisWeekAppts } = await supabase
      .from('appointments')
      .select('*')
      .eq('stylist_id', stylistId)
      .gte('appointment_date', thisWeek.start.toISOString())
      .lte('appointment_date', thisWeek.end.toISOString());

    const { data: lastWeekAppts } = await supabase
      .from('appointments')
      .select('*')
      .eq('stylist_id', stylistId)
      .gte(
        'appointment_date',
        new Date(
          thisWeek.start.getTime() - 7 * 24 * 60 * 60 * 1000
        ).toISOString()
      )
      .lte('appointment_date', thisWeek.start.toISOString());

    if (!thisWeekAppts || !lastWeekAppts) return null;

    const openSlots = 40 - thisWeekAppts.length; // Assume 40 slots/week capacity
    const avgRevenue = 120; // Average appointment value

    if (openSlots > 10) {
      return {
        type: 'revenue_opportunity',
        title: `${openSlots} Open Slots This Week`,
        description: `You have ${openSlots} available appointments. Send rebooking reminders to fill them.`,
        priority: 'high',
        confidence: 90,
        actionItems: [
          {
            title: 'Send batch reminders',
            url: '/messages?action=batch-reminder',
          },
          { title: 'View schedule', url: '/calendar' },
        ],
        potentialRevenue: openSlots * avgRevenue,
      };
    }

    return null;
  };

  const detectEfficiencyIssues = async (
    stylistId: string
  ): Promise<ProactiveInsight | null> => {
    const { data: recentAppts } = await supabase
      .from('appointments')
      .select('*')
      .eq('stylist_id', stylistId)
      .eq('status', 'no_show')
      .gte(
        'appointment_date',
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      )
      .order('appointment_date', { ascending: false });

    if (!recentAppts || recentAppts.length < 3) return null;

    const noShowRate = (recentAppts.length / 30) * 100; // Rough estimate

    if (noShowRate > 10) {
      return {
        type: 'efficiency',
        title: 'High No-Show Rate Detected',
        description: `${Math.round(noShowRate)}% no-show rate this month. Enable SMS reminders to reduce cancellations.`,
        priority: 'high',
        confidence: 75,
        actionItems: [
          { title: 'Enable SMS reminders', url: '/settings/notifications' },
          { title: 'Review no-show policy', url: '/settings/policies' },
        ],
        potentialRevenue: recentAppts.length * 100, // Revenue lost to no-shows
      };
    }

    return null;
  };

  const detectRetentionWins = async (
    stylistId: string
  ): Promise<ProactiveInsight | null> => {
    const { data: retentionScores } = await supabase
      .from('client_retention_scores')
      .select('*')
      .eq('stylist_id', stylistId)
      .gte('retention_score', 90);

    if (!retentionScores || retentionScores.length < 5) return null;

    return {
      type: 'retention',
      title: `${retentionScores.length} Highly Engaged Clients`,
      description: `You have ${retentionScores.length} clients with 90%+ retention scores. Ask for referrals!`,
      priority: 'medium',
      confidence: 95,
      actionItems: [
        { title: 'Send referral requests', url: '/referrals' },
        { title: 'View top clients', url: '/clients?filter=top' },
      ],
    };
  };

  const saveInsightsToDatabase = async (
    stylistId: string,
    insights: ProactiveInsight[]
  ) => {
    const insightsToSave = insights.map(insight => ({
      stylist_id: stylistId,
      insight_type: insight.type,
      title: insight.title,
      description: insight.description,
      priority: insight.priority,
      confidence_score: insight.confidence,
      action_items: insight.actionItems,
      potential_revenue: insight.potentialRevenue || 0,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Expire in 7 days
    }));

    await supabase.from('ai_insights').insert(insightsToSave);
  };

  return {
    insights,
    loading,
    lastGenerated,
    regenerate: generateInsights,
  };
};

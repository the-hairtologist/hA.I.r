/**
 * ✨ ENHANCEMENT: Client Churn Prediction Hook
 * Multi-factor churn prediction with confidence scoring and actionable insights
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { differenceInDays, subDays } from 'date-fns';
import { logger } from '@/lib/logging/productionLogger';

interface ChurnPrediction {
  clientId: string;
  clientName: string;
  churnProbability: number; // 0-1
  confidence: number; // 0-100
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  factors: ChurnFactor[];
  recommendedActions: ActionItem[];
  predictedLossValue: number;
}

interface ChurnFactor {
  factor: string;
  impact: 'positive' | 'negative';
  weight: number;
  description: string;
}

interface ActionItem {
  priority: number;
  action: string;
  expectedImpact: string;
  timing: 'immediate' | 'this_week' | 'this_month';
}

export const useClientChurnPredictor = (stylistId?: string) => {
  const [predictions, setPredictions] = useState<ChurnPrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (stylistId) {
      // Auto-run on mount
      runChurnAnalysis();

      // Auto-refresh weekly
      const interval = setInterval(
        () => {
          runChurnAnalysis();
        },
        7 * 24 * 60 * 60 * 1000
      );

      return () => clearInterval(interval);
    }
  }, [stylistId]);

  const runChurnAnalysis = async () => {
    if (!stylistId) return;

    setLoading(true);
    try {
      // Get all clients with appointment history
      const { data: clients } = await supabase
        .from('client_profiles')
        .select(
          `
          id,
          user:profiles(full_name),
          appointments(
            id,
            appointment_date,
            status,
            service_type
          )
        `
        )
        .eq('preferred_stylist_id', stylistId);

      if (!clients) return;

      const predictions: ChurnPrediction[] = [];

      for (const client of clients) {
        const prediction = await predictChurn(client);
        if (prediction && prediction.churnProbability >= 0.3) {
          predictions.push(prediction);
        }
      }

      // Sort by churn probability (highest first)
      predictions.sort((a, b) => b.churnProbability - a.churnProbability);

      setPredictions(predictions.slice(0, 20)); // Top 20 at-risk clients
      setLastUpdated(new Date());

      // Auto-save high-risk predictions to database
      const criticalPredictions = predictions.filter(
        p => p.riskLevel === 'critical'
      );
      if (criticalPredictions.length > 0) {
        await savePredictionsToDatabase(stylistId, criticalPredictions);
      }
    } catch (error) {
      logger.error('Error running churn analysis', error, {
        context: 'useClientChurnPredictor',
        data: { stylistId },
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * ✨ Multi-factor churn prediction algorithm
   */
  const predictChurn = async (client: any): Promise<ChurnPrediction | null> => {
    const appointments = client.appointments || [];
    if (appointments.length === 0) return null;

    const factors: ChurnFactor[] = [];
    let churnScore = 0;
    let confidenceScore = 0;

    // Factor 1: Days since last visit (WEIGHT: 0.35)
    const completedAppts = appointments.filter(
      (a: any) => a.status === 'completed'
    );
    if (completedAppts.length > 0) {
      const lastVisit = new Date(completedAppts[0].appointment_date);
      const daysSince = differenceInDays(new Date(), lastVisit);
      const avgInterval = calculateAvgInterval(completedAppts);

      const visitRecency = daysSince / avgInterval;
      const recencyScore = Math.min(visitRecency / 2, 1); // >2x average = high risk

      churnScore += recencyScore * 0.35;
      confidenceScore += 30;

      factors.push({
        factor: 'Visit Recency',
        impact: visitRecency > 1.5 ? 'negative' : 'positive',
        weight: 0.35,
        description: `${daysSince} days since last visit (avg: ${avgInterval} days)`,
      });
    }

    // Factor 2: Appointment cancellation rate (WEIGHT: 0.25)
    const canceledAppts = appointments.filter(
      (a: any) => a.status === 'cancelled'
    );
    const cancelRate = canceledAppts.length / appointments.length;

    churnScore += cancelRate * 0.25;
    confidenceScore += 20;

    factors.push({
      factor: 'Cancellation Rate',
      impact: cancelRate > 0.2 ? 'negative' : 'positive',
      weight: 0.25,
      description: `${Math.round(cancelRate * 100)}% cancellation rate`,
    });

    // Factor 3: Visit frequency decline (WEIGHT: 0.25)
    const recentAppts = completedAppts.filter(
      (a: any) =>
        differenceInDays(new Date(), new Date(a.appointment_date)) <= 180
    );
    const olderAppts = completedAppts.filter((a: any) => {
      const days = differenceInDays(new Date(), new Date(a.appointment_date));
      return days > 180 && days <= 365;
    });

    const recentFrequency = recentAppts.length / 6; // Per month
    const olderFrequency = olderAppts.length / 6;
    const frequencyDecline = Math.max(
      0,
      (olderFrequency - recentFrequency) / Math.max(olderFrequency, 1)
    );

    churnScore += frequencyDecline * 0.25;
    confidenceScore += 25;

    factors.push({
      factor: 'Visit Frequency Trend',
      impact: frequencyDecline > 0.3 ? 'negative' : 'positive',
      weight: 0.25,
      description: `${frequencyDecline > 0 ? 'Declining' : 'Stable'} visit frequency`,
    });

    // Factor 4: Service variety (WEIGHT: 0.15)
    const uniqueServices = new Set(appointments.map((a: any) => a.service_type))
      .size;
    const varietyScore = uniqueServices < 2 ? 0.5 : 0; // Low variety = moderate risk

    churnScore += varietyScore * 0.15;
    confidenceScore += 15;

    factors.push({
      factor: 'Service Variety',
      impact: uniqueServices >= 2 ? 'positive' : 'negative',
      weight: 0.15,
      description: `${uniqueServices} different services used`,
    });

    // Normalize confidence (0-100)
    const confidence = Math.min(confidenceScore, 100);

    // Determine risk level
    const riskLevel: 'critical' | 'high' | 'medium' | 'low' =
      churnScore >= 0.7
        ? 'critical'
        : churnScore >= 0.5
          ? 'high'
          : churnScore >= 0.3
            ? 'medium'
            : 'low';

    // Generate recommended actions
    const actions = generateActions(churnScore, factors, completedAppts.length);

    // Calculate predicted loss value
    const avgAppointmentValue = 120;
    const expectedVisitsPerYear = 365 / calculateAvgInterval(completedAppts);
    const predictedLossValue = avgAppointmentValue * expectedVisitsPerYear;

    return {
      clientId: client.id,
      clientName: client.user?.full_name || 'Unknown',
      churnProbability: churnScore,
      confidence,
      riskLevel,
      factors,
      recommendedActions: actions,
      predictedLossValue,
    };
  };

  const calculateAvgInterval = (appointments: any[]): number => {
    if (appointments.length < 2) return 42; // Default 6 weeks

    const intervals = [];
    for (let i = 0; i < appointments.length - 1; i++) {
      const diff = differenceInDays(
        new Date(appointments[i].appointment_date),
        new Date(appointments[i + 1].appointment_date)
      );
      intervals.push(Math.abs(diff));
    }

    return intervals.reduce((a, b) => a + b, 0) / intervals.length;
  };

  const generateActions = (
    churnScore: number,
    factors: ChurnFactor[],
    visitCount: number
  ): ActionItem[] => {
    const actions: ActionItem[] = [];

    // Action 1: Personalized message (always recommended)
    actions.push({
      priority: churnScore >= 0.7 ? 1 : 2,
      action: 'Send personalized "We miss you" message',
      expectedImpact: 'Increase rebooking probability by 35%',
      timing: churnScore >= 0.7 ? 'immediate' : 'this_week',
    });

    // Action 2: Special offer for high-risk clients
    if (churnScore >= 0.5) {
      actions.push({
        priority: 2,
        action: 'Offer 15% loyalty discount on next visit',
        expectedImpact: 'Reduce churn risk by 40%',
        timing: 'immediate',
      });
    }

    // Action 3: Service variety recommendation
    const varietyFactor = factors.find(f => f.factor === 'Service Variety');
    if (varietyFactor && varietyFactor.impact === 'negative') {
      actions.push({
        priority: 3,
        action: 'Suggest trying a new service (color consultation, treatment)',
        expectedImpact: 'Increase engagement and visit frequency',
        timing: 'this_week',
      });
    }

    // Action 4: Personal call for loyal but at-risk clients
    if (visitCount >= 5 && churnScore >= 0.6) {
      actions.push({
        priority: 1,
        action: 'Make personal phone call to check in',
        expectedImpact: 'Shows care, often rescues relationship',
        timing: 'immediate',
      });
    }

    return actions.sort((a, b) => a.priority - b.priority);
  };

  const savePredictionsToDatabase = async (
    stylistId: string,
    predictions: ChurnPrediction[]
  ) => {
    // Save as AI insights for dashboard display
    const insights = predictions.map(p => ({
      stylist_id: stylistId,
      insight_type: 'retention',
      title: `${p.clientName} - ${p.riskLevel.toUpperCase()} Churn Risk`,
      description: `${Math.round(p.churnProbability * 100)}% chance of churn. ${p.factors[0]?.description || ''}`,
      priority: p.riskLevel === 'critical' ? 'urgent' : p.riskLevel,
      confidence_score: p.confidence,
      action_items: p.recommendedActions as any,
      potential_revenue: p.predictedLossValue,
      affected_clients: [p.clientId],
      expires_at: subDays(new Date(), -14).toISOString(), // Expire in 14 days
    }));

    await supabase.from('ai_insights').insert(insights);
  };

  return {
    predictions,
    loading,
    lastUpdated,
    refresh: runChurnAnalysis,
    criticalCount: predictions.filter(p => p.riskLevel === 'critical').length,
    highRiskCount: predictions.filter(p => p.riskLevel === 'high').length,
  };
};

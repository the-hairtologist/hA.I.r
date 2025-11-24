/**
 * AI Feature Analytics Hook
 * Tracks usage and performance of AI features
 */

import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { EnrichedAIError } from '@/lib/aiErrorContext';

export interface AIAnalyticsEvent {
  eventType:
    | 'formula_validation'
    | 'visual_analysis'
    | 'quick_formula'
    | 'outcome_tracked'
    | 'prediction_viewed'
    | 'model_routed'
    | 'ai_error';
  feature: string;
  metadata?: Record<string, any>;
  performanceMs?: number;
}

export function useAIAnalytics() {
  const trackEvent = useCallback(async (event: AIAnalyticsEvent) => {
    try {
      // Track in local analytics (Google Analytics, etc.)
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', event.eventType, {
          feature: event.feature,
          performance_ms: event.performanceMs,
          ...event.metadata,
        });
      }

      // Also store in database for detailed analysis
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('ai_analytics_events').insert({
        user_id: user.id,
        event_type: event.eventType,
        feature: event.feature,
        metadata: event.metadata || {},
        performance_ms: event.performanceMs,
      });

      // ✨ ENHANCEMENT: Auto-generate insights from patterns
      // Check if we should trigger automated insight generation
      if (
        event.eventType === 'formula_validation' ||
        event.eventType === 'visual_analysis' ||
        event.eventType === 'prediction_viewed'
      ) {
        // Trigger background insight generation (non-blocking)
        generateAutomatedInsights(user.id, event).catch(() => {});
      }
    } catch {
      // Silently fail analytics - don't break user experience
    }
  }, []);

  // ✨ ENHANCEMENT: Auto-generate insights from usage patterns
  const generateAutomatedInsights = async (
    userId: string,
    event: AIAnalyticsEvent
  ) => {
    // Get recent analytics to detect patterns
    const { data: recentEvents } = await supabase
      .from('ai_analytics_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!recentEvents || recentEvents.length < 5) return;

    // Detect patterns and generate insights
    const patterns = analyzePatterns(recentEvents);

    if (patterns.shouldGenerateInsight && patterns.stylistId) {
      // Auto-create AI insight
      await supabase.from('ai_insights').insert({
        insight_type: patterns.type,
        title: patterns.title,
        description: patterns.description,
        priority: patterns.priority,
        confidence_score: patterns.confidence,
        action_items: patterns.actions as any,
        potential_revenue: patterns.revenue,
      } as any);
    }
  };

  const analyzePatterns = (events: any[]) => {
    // Pattern detection logic
    const formulaEvents = events.filter(
      e => e.event_type === 'formula_validation'
    );
    const errorRate =
      formulaEvents.filter(e => e.metadata?.blockerCount > 0).length /
      formulaEvents.length;

    // High error rate pattern
    if (errorRate > 0.3 && formulaEvents.length >= 5) {
      return {
        shouldGenerateInsight: true,
        stylistId: events[0].metadata?.stylistId,
        type: 'efficiency',
        title: 'Formula Safety Patterns Detected',
        description: `We've noticed ${Math.round(errorRate * 100)}% of your recent formulas triggered safety warnings. Consider reviewing your color mixing ratios.`,
        priority: 'medium',
        confidence: Math.min(errorRate * 100, 95),
        actions: [
          { title: 'Review last 5 formulas', url: '/formulas' },
          { title: 'Check mixing guidelines', url: '/assistant' },
        ],
        revenue: 0,
      };
    }

    return { shouldGenerateInsight: false };
  };

  const trackFormulaValidation = useCallback(
    (result: {
      isSafe: boolean;
      warningCount: number;
      blockerCount: number;
    }) => {
      trackEvent({
        eventType: 'formula_validation',
        feature: 'safety_validator',
        metadata: result,
      });
    },
    [trackEvent]
  );

  const trackVisualAnalysis = useCallback(
    (result: {
      confidence: number;
      detectedLevel: number;
      processingTimeMs: number;
    }) => {
      trackEvent({
        eventType: 'visual_analysis',
        feature: 'hair_analyzer',
        metadata: result,
        performanceMs: result.processingTimeMs,
      });
    },
    [trackEvent]
  );

  const trackQuickFormula = useCallback(
    (result: { cached: boolean; responseTimeMs: number }) => {
      trackEvent({
        eventType: 'quick_formula',
        feature: 'quick_mode',
        metadata: result,
        performanceMs: result.responseTimeMs,
      });
    },
    [trackEvent]
  );

  const trackOutcome = useCallback(
    (rating: string) => {
      trackEvent({
        eventType: 'outcome_tracked',
        feature: 'learning_loop',
        metadata: { rating },
      });
    },
    [trackEvent]
  );

  const trackPrediction = useCallback(
    (insightCount: number) => {
      trackEvent({
        eventType: 'prediction_viewed',
        feature: 'predictive_insights',
        metadata: { insightCount },
      });
    },
    [trackEvent]
  );

  const trackModelRouting = useCallback(
    (model: string, queryType: string) => {
      trackEvent({
        eventType: 'model_routed',
        feature: 'smart_routing',
        metadata: { model, queryType },
      });
    },
    [trackEvent]
  );

  const trackAIError = useCallback(
    (error: EnrichedAIError) => {
      trackEvent({
        eventType: 'ai_error',
        feature: error.aiContext.feature,
        metadata: {
          errorCode: error.code,
          model: error.aiContext.model,
          executionTimeMs: error.aiContext.executionTimeMs,
          rateLimitRemaining: error.aiContext.rateLimitRemaining,
          suggestedAction: error.aiContext.suggestedAction,
          retryable: error.retryable,
        },
        performanceMs: error.aiContext.executionTimeMs,
      });
    },
    [trackEvent]
  );

  return {
    trackEvent,
    trackFormulaValidation,
    trackVisualAnalysis,
    trackQuickFormula,
    trackOutcome,
    trackPrediction,
    trackModelRouting,
    trackAIError,
  };
}

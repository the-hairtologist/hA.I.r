/**
 * AI Feature Analytics Hook
 * Tracks usage and performance of AI features
 */

import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AIAnalyticsEvent {
  eventType: 
    | 'formula_validation'
    | 'visual_analysis'
    | 'quick_formula'
    | 'outcome_tracked'
    | 'prediction_viewed'
    | 'model_routed';
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
          ...event.metadata
        });
      }

      // Also store in database for detailed analysis
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('ai_analytics_events').insert({
        user_id: user.id,
        event_type: event.eventType,
        feature: event.feature,
        metadata: event.metadata || {},
        performance_ms: event.performanceMs
      });
    } catch (error) {
      // Silently fail analytics - don't break user experience
      console.warn('Analytics tracking failed:', error);
    }
  }, []);

  const trackFormulaValidation = useCallback((result: {
    isSafe: boolean;
    warningCount: number;
    blockerCount: number;
  }) => {
    trackEvent({
      eventType: 'formula_validation',
      feature: 'safety_validator',
      metadata: result
    });
  }, [trackEvent]);

  const trackVisualAnalysis = useCallback((result: {
    confidence: number;
    detectedLevel: number;
    processingTimeMs: number;
  }) => {
    trackEvent({
      eventType: 'visual_analysis',
      feature: 'hair_analyzer',
      metadata: result,
      performanceMs: result.processingTimeMs
    });
  }, [trackEvent]);

  const trackQuickFormula = useCallback((result: {
    cached: boolean;
    responseTimeMs: number;
  }) => {
    trackEvent({
      eventType: 'quick_formula',
      feature: 'quick_mode',
      metadata: result,
      performanceMs: result.responseTimeMs
    });
  }, [trackEvent]);

  const trackOutcome = useCallback((rating: string) => {
    trackEvent({
      eventType: 'outcome_tracked',
      feature: 'learning_loop',
      metadata: { rating }
    });
  }, [trackEvent]);

  const trackPrediction = useCallback((insightCount: number) => {
    trackEvent({
      eventType: 'prediction_viewed',
      feature: 'predictive_insights',
      metadata: { insightCount }
    });
  }, [trackEvent]);

  const trackModelRouting = useCallback((model: string, queryType: string) => {
    trackEvent({
      eventType: 'model_routed',
      feature: 'smart_routing',
      metadata: { model, queryType }
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackFormulaValidation,
    trackVisualAnalysis,
    trackQuickFormula,
    trackOutcome,
    trackPrediction,
    trackModelRouting
  };
}

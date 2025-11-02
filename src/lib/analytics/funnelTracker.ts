/**
 * Funnel Tracker Service
 * Track user progression through conversion funnels
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface FunnelStep {
  funnelName: string;
  stepName: string;
  stepOrder: number;
  metadata?: Record<string, any>;
}

class FunnelTracker {
  private funnelStarts: Map<string, number> = new Map();

  /**
   * Track entry into a funnel
   */
  async startFunnel(funnelName: string, metadata?: Record<string, any>) {
    this.funnelStarts.set(funnelName, Date.now());

    await this.trackStep({
      funnelName,
      stepName: 'funnel_started',
      stepOrder: 0,
      metadata,
    });

    logger.debug(
      `[FunnelTracker] Started funnel: ${funnelName}`,
      'funnelTracker'
    );
  }

  /**
   * Track completion of a funnel step
   */
  async completeStep(params: FunnelStep) {
    const startTime = this.funnelStarts.get(params.funnelName);
    const timeToComplete = startTime ? Date.now() - startTime : null;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { error } = await supabase.from('conversion_funnel_events').insert({
        user_id: user.id,
        funnel_name: params.funnelName,
        step_name: params.stepName,
        step_order: params.stepOrder,
        completed: true,
        abandoned: false,
        time_to_complete_ms: timeToComplete,
        metadata: params.metadata || {},
      });

      if (error) throw error;

      logger.debug(
        `[FunnelTracker] Completed step: ${params.stepName} in ${params.funnelName}`,
        'funnelTracker'
      );
    } catch (error) {
      logger.error(
        '[FunnelTracker] Failed to track step',
        'funnelTracker',
        error
      );
    }
  }

  /**
   * Track abandonment of a funnel
   */
  async abandonFunnel(params: FunnelStep) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { error } = await supabase.from('conversion_funnel_events').insert({
        user_id: user.id,
        funnel_name: params.funnelName,
        step_name: params.stepName,
        step_order: params.stepOrder,
        completed: false,
        abandoned: true,
        metadata: params.metadata || {},
      });

      if (error) throw error;

      this.funnelStarts.delete(params.funnelName);

      logger.debug(
        `[FunnelTracker] Abandoned funnel: ${params.funnelName} at step: ${params.stepName}`,
        'funnelTracker'
      );
    } catch (error) {
      logger.error(
        '[FunnelTracker] Failed to track abandonment',
        'funnelTracker',
        error
      );
    }
  }

  /**
   * Track just viewing a step (not completion)
   */
  private async trackStep(params: FunnelStep) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { error } = await supabase.from('conversion_funnel_events').insert({
        user_id: user.id,
        funnel_name: params.funnelName,
        step_name: params.stepName,
        step_order: params.stepOrder,
        completed: false,
        abandoned: false,
        metadata: params.metadata || {},
      });

      if (error) throw error;
    } catch (error) {
      logger.error(
        '[FunnelTracker] Failed to track step view',
        'funnelTracker',
        error
      );
    }
  }

  /**
   * Complete entire funnel
   */
  async completeFunnel(funnelName: string, metadata?: Record<string, any>) {
    await this.completeStep({
      funnelName,
      stepName: 'funnel_completed',
      stepOrder: 999,
      metadata,
    });

    this.funnelStarts.delete(funnelName);
    logger.debug(
      `[FunnelTracker] Completed funnel: ${funnelName}`,
      'funnelTracker'
    );
  }
}

export const funnelTracker = new FunnelTracker();

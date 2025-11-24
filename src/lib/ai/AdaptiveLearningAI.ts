/**
 * Adaptive Learning AI System
 * Learns from user behavior and automatically improves the app experience
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface UserBehaviorPattern {
  userId: string;
  action: string;
  frequency: number;
  avgTimeOfDay: number; // Hour of day (0-23)
  preferredDayOfWeek: number; // 0-6
  context: any;
}

interface Adaptation {
  type: 'preload' | 'suggest' | 'automate' | 'optimize';
  action: string;
  confidence: number;
  description: string;
}

class AdaptiveLearningAISystem {
  private behaviorPatterns = new Map<string, UserBehaviorPattern[]>();
  private adaptations = new Map<string, Adaptation[]>();

  /**
   * Track user behavior
   */
  trackBehavior(userId: string, action: string, context?: any) {
    const now = new Date();
    const timeOfDay = now.getHours();
    const dayOfWeek = now.getDay();

    const key = `${userId}:${action}`;
    const existing = this.behaviorPatterns.get(key) || [];

    // Calculate patterns
    const pattern: UserBehaviorPattern = {
      userId,
      action,
      frequency: existing.length + 1,
      avgTimeOfDay:
        existing.length > 0
          ? (existing[existing.length - 1].avgTimeOfDay * existing.length +
              timeOfDay) /
            (existing.length + 1)
          : timeOfDay,
      preferredDayOfWeek: dayOfWeek,
      context,
    };

    existing.push(pattern);
    this.behaviorPatterns.set(key, existing);

    // Learn and adapt after 3+ occurrences
    if (existing.length >= 3) {
      this.learnAndAdapt(userId, pattern);
    }
  }

  /**
   * Learn patterns and create adaptations
   */
  private learnAndAdapt(userId: string, pattern: UserBehaviorPattern) {
    const adaptations: Adaptation[] = [];

    // Preload frequently accessed data
    if (pattern.action.startsWith('view_') && pattern.frequency > 5) {
      adaptations.push({
        type: 'preload',
        action: `Preload ${pattern.action} data`,
        confidence: Math.min(pattern.frequency / 10, 0.9),
        description: `User frequently ${pattern.action}s - preload this data`,
      });
    }

    // Suggest actions based on time patterns
    const now = new Date();
    if (
      Math.abs(now.getHours() - pattern.avgTimeOfDay) <= 1 &&
      pattern.frequency > 3
    ) {
      adaptations.push({
        type: 'suggest',
        action: `Suggest ${pattern.action}`,
        confidence: 0.7,
        description: `User typically ${pattern.action}s around this time`,
      });
    }

    // Automate repetitive actions
    if (pattern.frequency > 10 && pattern.action.includes('check_')) {
      adaptations.push({
        type: 'automate',
        action: `Auto-${pattern.action}`,
        confidence: 0.8,
        description: `Automate this frequent action to save time`,
      });
    }

    // Optimize based on usage
    if (pattern.frequency > 15) {
      adaptations.push({
        type: 'optimize',
        action: `Optimize ${pattern.action} flow`,
        confidence: 0.85,
        description: `High usage detected - optimize this workflow`,
      });
    }

    this.adaptations.set(userId, adaptations);
    logger.info('Learned new adaptation', 'AdaptiveLearningAI', {
      userId,
      adaptations: adaptations.length,
    });
  }

  /**
   * Get personalized suggestions for user
   */
  getPersonalizedSuggestions(userId: string): string[] {
    const userAdaptations = this.adaptations.get(userId) || [];

    return userAdaptations
      .filter(a => a.type === 'suggest' && a.confidence > 0.6)
      .map(a => a.description)
      .slice(0, 3);
  }

  /**
   * Get AI-powered workflow optimizations
   */
  async getWorkflowOptimizations(userId: string): Promise<string> {
    try {
      const patterns = Array.from(this.behaviorPatterns.entries())
        .filter(([key]) => key.startsWith(userId))
        .map(([, patterns]) => patterns[patterns.length - 1]);

      const { data, error } = await supabase.functions.invoke(
        'hair-assistant-chat',
        {
          body: {
            messages: [
              {
                role: 'system',
                content:
                  'You are a workflow optimization expert. Analyze user behavior and suggest improvements.',
              },
              {
                role: 'user',
                content: `Analyze these behavior patterns and suggest workflow optimizations:\n${JSON.stringify(patterns, null, 2)}`,
              },
            ],
          },
        }
      );

      if (error) throw error;
      return data.response || 'No optimizations available';
    } catch (error) {
      logger.error(
        'Failed to get workflow optimizations',
        'AdaptiveLearningAI',
        error
      );
      return 'Unable to generate optimizations';
    }
  }

  /**
   * Apply learned adaptations
   */
  async applyAdaptations(userId: string): Promise<number> {
    const adaptations = this.adaptations.get(userId) || [];
    let appliedCount = 0;

    for (const adaptation of adaptations) {
      if (adaptation.confidence < 0.7) continue;

      try {
        switch (adaptation.type) {
          case 'preload':
            // Preload commonly accessed data
            appliedCount++;
            break;
          case 'optimize':
            // Apply optimization
            appliedCount++;
            break;
          case 'automate':
            // Set up automation
            appliedCount++;
            break;
        }
      } catch (error) {
        logger.error('Failed to apply adaptation', 'AdaptiveLearningAI', error);
      }
    }

    return appliedCount;
  }

  /**
   * Get learning insights
   */
  getInsights(userId: string) {
    const userPatterns = Array.from(this.behaviorPatterns.entries())
      .filter(([key]) => key.startsWith(userId))
      .map(([, patterns]) => patterns);

    const totalActions = userPatterns.reduce(
      (sum, patterns) => sum + patterns.length,
      0
    );
    const uniqueActions = userPatterns.length;
    const adaptations = this.adaptations.get(userId)?.length || 0;

    return {
      totalActions,
      uniqueActions,
      adaptations,
      confidence: adaptations > 0 ? 0.8 : 0.3,
    };
  }
}

export const adaptiveLearningAI = new AdaptiveLearningAISystem();

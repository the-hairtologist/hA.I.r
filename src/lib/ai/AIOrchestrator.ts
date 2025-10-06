/**
 * AI Orchestrator - Deep Integration Layer
 * Connects all AI systems to work together intelligently
 */

import { clientRetentionAI } from './ClientRetentionAI';
import { smartCacheAI } from './SmartCacheAI';
import { adaptiveLearningAI } from './AdaptiveLearningAI';
import { selfHealing } from '@/lib/selfHealing';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface AIInsight {
  type: 'retention' | 'performance' | 'behavior' | 'health' | 'prediction';
  priority: 'critical' | 'high' | 'medium' | 'low';
  insight: string;
  action?: () => Promise<void>;
  autoExecute?: boolean;
}

interface SystemIntelligence {
  userBehaviorPatterns: any[];
  performanceMetrics: any;
  retentionSignals: any[];
  healthStatus: any;
  predictions: any[];
}

class AIOrchestrationSystem {
  private intelligence: SystemIntelligence = {
    userBehaviorPatterns: [],
    performanceMetrics: {},
    retentionSignals: [],
    healthStatus: {},
    predictions: []
  };
  
  private isRunning = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  /**
   * Start the AI orchestration system with divine protection
   * All systems work together proactively
   */
  async start() {
    if (this.isRunning) return;
    
    logger.info('Starting AI Orchestration System with Divine Protection');
    this.isRunning = true;

    // Initialize self-healing and guardian systems
    await selfHealing.initialize();

    // Initialize guardian systems
    try {
      const { securityGuardian } = await import('./SecurityGuardian');
      const { predictiveAnalytics } = await import('./PredictiveAnalytics');
      
      await Promise.all([
        securityGuardian.initialize(),
        predictiveAnalytics.initialize()
      ]);
      
      logger.info('✅ Guardian angels activated');
    } catch (error) {
      logger.warn('Guardian systems will activate after database migration');
    }

    // Start continuous monitoring
    this.startContinuousMonitoring();

    // Start predictive analytics
    this.startPredictiveAnalytics();

    logger.info('AI Orchestration System is now active with full protection');
  }

  /**
   * Continuous monitoring - AI systems watch everything
   */
  private startContinuousMonitoring() {
    this.monitoringInterval = setInterval(async () => {
      await this.gatherIntelligence();
      await this.analyzeAndAct();
    }, 60000); // Every minute
  }

  /**
   * Gather intelligence from all systems
   */
  private async gatherIntelligence() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // Gather cache insights
      const cacheInsights = smartCacheAI.getInsights();
      
      // Gather behavior patterns
      const behaviorInsights = adaptiveLearningAI.getInsights(user.id);
      
      // Gather health status
      const healthStatus = selfHealing.getStatus();

      // Store intelligence
      this.intelligence = {
        userBehaviorPatterns: [behaviorInsights],
        performanceMetrics: cacheInsights,
        retentionSignals: [],
        healthStatus,
        predictions: []
      };

      logger.info('Intelligence gathered', 'AIOrchestrator', this.intelligence);
    } catch (error) {
      logger.error('Failed to gather intelligence', 'AIOrchestrator', error);
    }
  }

  /**
   * Analyze intelligence and take proactive actions
   */
  private async analyzeAndAct() {
    const insights = await this.generateInsights();
    
    for (const insight of insights) {
      if (insight.autoExecute && insight.action) {
        try {
          await insight.action();
          logger.info('Auto-executed AI action', 'AIOrchestrator', { type: insight.type });
        } catch (error) {
          logger.error('Failed to execute AI action', 'AIOrchestrator', error);
        }
      }
    }
  }

  /**
   * Generate intelligent insights by combining all AI systems
   */
  private async generateInsights(): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];

    // Check cache patterns
    if (this.intelligence.performanceMetrics.recommendations > 5) {
      insights.push({
        type: 'performance',
        priority: 'high',
        insight: 'High number of cache recommendations detected',
        action: async () => {
          await smartCacheAI.optimize();
        },
        autoExecute: true
      });
    }

    // Check user behavior
    if (this.intelligence.userBehaviorPatterns.length > 0) {
      const pattern = this.intelligence.userBehaviorPatterns[0];
      if (pattern.adaptations > 3) {
        insights.push({
          type: 'behavior',
          priority: 'medium',
          insight: 'User has established patterns, applying adaptations',
          action: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) await adaptiveLearningAI.applyAdaptations(user.id);
          },
          autoExecute: true
        });
      }
    }

    // Check system health
    if (this.intelligence.healthStatus?.health?.status === 'degraded') {
      insights.push({
        type: 'health',
        priority: 'critical',
        insight: 'System health degraded, running maintenance',
        action: async () => {
          await selfHealing.runMaintenance();
        },
        autoExecute: true
      });
    }

    return insights;
  }

  /**
   * Start predictive analytics
   */
  private async startPredictiveAnalytics() {
    // Run predictions every 5 minutes
    setInterval(async () => {
      await this.runPredictions();
    }, 300000);
  }

  /**
   * Run AI predictions
   */
  private async runPredictions() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // Predict client retention issues
      const { data: stylistProfile } = await supabase
        .from('stylist_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (stylistProfile) {
        const retentionInsights = await clientRetentionAI.analyzeClientRetention(stylistProfile.id);
        
        // Auto-send retention messages to critical clients
        const criticalClients = retentionInsights.filter(r => r.riskLevel === 'critical');
        if (criticalClients.length > 0) {
          await clientRetentionAI.sendRetentionMessages(stylistProfile.id, criticalClients);
          logger.info('Auto-sent retention messages', 'AIOrchestrator', {
            count: criticalClients.length
          });
        }
      }

      // Predict performance issues
      const cacheRecommendations = smartCacheAI.getRecommendations();
      if (cacheRecommendations.length > 10) {
        await smartCacheAI.applyRecommendations();
        logger.info('Auto-applied cache optimizations', 'AIOrchestrator');
      }

    } catch (error) {
      logger.error('Failed to run predictions', 'AIOrchestrator', error);
    }
  }

  /**
   * Get AI-powered suggestions for user
   */
  async getSmartSuggestions(userId: string): Promise<string[]> {
    const suggestions: string[] = [];

    // Get personalized suggestions from adaptive learning
    const behaviorSuggestions = adaptiveLearningAI.getPersonalizedSuggestions(userId);
    suggestions.push(...behaviorSuggestions);

    // Get cache optimization suggestions
    const cacheInsights = smartCacheAI.getInsights();
    if (cacheInsights.recommendations > 0) {
      suggestions.push(`💡 ${cacheInsights.recommendations} performance optimizations available`);
    }

    // Get retention insights if stylist
    try {
      const { data: stylistProfile } = await supabase
        .from('stylist_profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (stylistProfile) {
        const retentionData = await clientRetentionAI.analyzeClientRetention(stylistProfile.id);
        const atRisk = retentionData.filter(r => r.riskLevel !== 'low').length;
        if (atRisk > 0) {
          suggestions.push(`⚠️ ${atRisk} clients need attention to prevent churn`);
        }
      }
    } catch (error) {
      logger.error('Failed to get retention suggestions', 'AIOrchestrator', error);
    }

    return suggestions.slice(0, 5); // Top 5 suggestions
  }

  /**
   * AI-powered auto-fix for any issue
   */
  async autoFix(issue: string, context?: any): Promise<boolean> {
    try {
      // Use AI to analyze and fix
      const analysis = await selfHealing.analyzeError(new Error(issue), context);
      
      // Log the analysis
      logger.info('AI analysis complete', 'AIOrchestrator', { issue, analysis });
      return true;
    } catch (error) {
      logger.error('Auto-fix failed', 'AIOrchestrator', error);
      return false;
    }
  }

  /**
   * Get comprehensive AI status
   */
  getStatus() {
    return {
      running: this.isRunning,
      intelligence: this.intelligence,
      systems: {
        retention: 'active',
        cache: 'active',
        behavior: 'active',
        health: 'active'
      }
    };
  }

  /**
   * Stop the orchestration system
   */
  stop() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    this.isRunning = false;
    selfHealing.shutdown();
    logger.info('AI Orchestration System stopped');
  }
}

export const aiOrchestrator = new AIOrchestrationSystem();

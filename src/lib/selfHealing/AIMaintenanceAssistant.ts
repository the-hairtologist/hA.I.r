/**
 * AI-Powered Maintenance Assistant
 * 
 * Uses Lovable AI to analyze errors, suggest fixes, and provide maintenance insights.
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/lib/logger';

interface ErrorAnalysis {
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  suggestedFix: string;
  preventionTips: string[];
  relatedDocs: string[];
}

interface MaintenanceReport {
  timestamp: Date;
  overallHealth: 'good' | 'fair' | 'poor';
  issues: Array<{
    component: string;
    description: string;
    recommendation: string;
  }>;
  optimizations: string[];
  predictions: string[];
}

class AIMaintenanceAssistant {
  /**
   * Analyze an error using AI
   */
  async analyzeError(
    errorMessage: string,
    errorStack?: string,
    context?: any
  ): Promise<ErrorAnalysis> {
    try {
      const prompt = `Analyze this error and provide insights:
Error: ${errorMessage}
Stack: ${errorStack?.substring(0, 500) || 'Not available'}
Context: ${JSON.stringify(context || {}, null, 2)}

Provide:
1. Severity level (low/medium/high/critical)
2. Error category (network/auth/data/logic/performance)
3. Suggested fix
4. Prevention tips (3-5 actionable items)
5. Related documentation links

Format as JSON.`;

      const { data, error } = await supabase.functions.invoke('hair-assistant-chat', {
        body: {
          message: prompt,
          context: 'error_analysis',
        },
      });

      if (error) throw error;

      const analysis = this.parseAIResponse(data.response);
      
      logger.info('AI error analysis completed', 'AIMaintenanceAssistant', {
        severity: analysis.severity,
        category: analysis.category,
      });

      return analysis;
    } catch (error) {
      logger.error('AI analysis failed', 'AIMaintenanceAssistant', error);
      return this.getFallbackAnalysis(errorMessage);
    }
  }

  /**
   * Generate maintenance report
   */
  async generateMaintenanceReport(
    errorLogs: any[],
    performanceMetrics: any
  ): Promise<MaintenanceReport> {
    try {
      const prompt = `Generate a maintenance report based on:
Recent Errors (last 24h): ${errorLogs.length} errors
Top Error Types: ${this.summarizeErrors(errorLogs)}
Performance Metrics:
- Avg API Latency: ${performanceMetrics.avgLatency}ms
- Memory Usage: ${(performanceMetrics.memoryUsage * 100).toFixed(1)}%
- Error Rate: ${(performanceMetrics.errorRate * 100).toFixed(1)}%

Provide:
1. Overall health assessment (good/fair/poor)
2. Top 5 issues requiring attention
3. Optimization recommendations
4. Predictive insights about potential future issues

Format as JSON.`;

      const { data, error } = await supabase.functions.invoke('hair-assistant-chat', {
        body: {
          message: prompt,
          context: 'maintenance_report',
        },
      });

      if (error) throw error;

      const report = this.parseMaintenanceReport(data.response);
      
      logger.info('Maintenance report generated', 'AIMaintenanceAssistant', {
        health: report.overallHealth,
        issueCount: report.issues.length,
      });

      return report;
    } catch (error) {
      logger.error('Failed to generate report', 'AIMaintenanceAssistant', error);
      return this.getFallbackReport();
    }
  }

  /**
   * Get optimization suggestions
   */
  async getOptimizationSuggestions(
    componentName: string,
    metrics: any
  ): Promise<string[]> {
    try {
      const prompt = `Suggest optimizations for component: ${componentName}
Current metrics:
- Render time: ${metrics.renderTime}ms
- Re-renders: ${metrics.rerenderCount}
- Memory footprint: ${metrics.memoryUsage}KB

Provide 5 specific, actionable optimization suggestions.`;

      const { data, error } = await supabase.functions.invoke('hair-assistant-chat', {
        body: {
          message: prompt,
          context: 'optimization',
        },
      });

      if (error) throw error;

      const suggestions = this.parseOptimizationSuggestions(data.response);
      
      logger.info('Optimization suggestions generated', 'AIMaintenanceAssistant', {
        component: componentName,
        suggestionCount: suggestions.length,
      });

      return suggestions;
    } catch (error) {
      logger.error('Failed to get optimizations', 'AIMaintenanceAssistant', error);
      return this.getFallbackOptimizations();
    }
  }

  /**
   * Predict potential issues
   */
  async predictIssues(historicalData: any[]): Promise<string[]> {
    if (historicalData.length < 10) {
      return ['Not enough data for predictions'];
    }

    try {
      const prompt = `Based on historical error patterns, predict potential future issues:
${JSON.stringify(historicalData.slice(-20), null, 2)}

Provide 3-5 predictions with preventive actions.`;

      const { data, error } = await supabase.functions.invoke('hair-assistant-chat', {
        body: {
          message: prompt,
          context: 'prediction',
        },
      });

      if (error) throw error;

      return this.parsePredictions(data.response);
    } catch (error) {
      logger.error('Prediction failed', 'AIMaintenanceAssistant', error);
      return ['Unable to generate predictions'];
    }
  }

  private parseAIResponse(response: string): ErrorAnalysis {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      // Fall through to fallback
    }

    return this.getFallbackAnalysis(response);
  }

  private parseMaintenanceReport(response: string): MaintenanceReport {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      // Fall through to fallback
    }

    return this.getFallbackReport();
  }

  private parseOptimizationSuggestions(response: string): string[] {
    const lines = response.split('\n').filter(line => line.trim());
    return lines.slice(0, 5);
  }

  private parsePredictions(response: string): string[] {
    const lines = response.split('\n').filter(line => line.trim());
    return lines.slice(0, 5);
  }

  private summarizeErrors(errors: any[]): string {
    const counts: { [key: string]: number } = {};
    errors.forEach(err => {
      const msg = err.error_message || 'Unknown';
      counts[msg] = (counts[msg] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([msg, count]) => `${msg} (${count}x)`)
      .join(', ');
  }

  private getFallbackAnalysis(errorMessage: string): ErrorAnalysis {
    return {
      severity: 'medium',
      category: 'unknown',
      suggestedFix: 'Review error logs and check network connectivity',
      preventionTips: [
        'Implement proper error boundaries',
        'Add retry logic for network requests',
        'Validate data before processing',
      ],
      relatedDocs: [],
    };
  }

  private getFallbackReport(): MaintenanceReport {
    return {
      timestamp: new Date(),
      overallHealth: 'fair',
      issues: [
        {
          component: 'System',
          description: 'Unable to generate detailed report',
          recommendation: 'Check AI service connectivity',
        },
      ],
      optimizations: ['Review error logs manually'],
      predictions: ['Monitor system health'],
    };
  }

  private getFallbackOptimizations(): string[] {
    return [
      'Implement React.memo for expensive components',
      'Use useMemo for complex calculations',
      'Implement virtual scrolling for long lists',
      'Optimize image loading with lazy loading',
      'Reduce bundle size by code splitting',
    ];
  }
}

// Singleton instance
export const aiMaintenance = new AIMaintenanceAssistant();

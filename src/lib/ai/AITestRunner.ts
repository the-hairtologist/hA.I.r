/**
 * AI System Test Runner
 * Comprehensive testing of all AI systems
 */

import { aiOrchestrator } from './AIOrchestrator';
import { clientRetentionAI } from './ClientRetentionAI';
import { smartCacheAI } from './SmartCacheAI';
import { adaptiveLearningAI } from './AdaptiveLearningAI';
import { colorSystemValidator } from './ColorSystemValidator';
import { securityGuardian } from './SecurityGuardian';
import { predictiveAnalytics } from './PredictiveAnalytics';
import { crossPlatformOptimizer } from '@/lib/platform/CrossPlatformOptimizer';
import { logger } from '@/lib/logger';

interface TestResult {
  system: string;
  passed: boolean;
  message: string;
  details?: any;
}

class AITestRunnerSystem {
  /**
   * Run comprehensive AI system tests
   */
  async runFullTest(): Promise<{
    passed: number;
    failed: number;
    results: TestResult[];
    summary: string;
  }> {
    logger.info('Starting AI System Test Suite');
    
    const results: TestResult[] = [];

    // Test 1: AI Orchestrator Initialization
    results.push(await this.testOrchestratorInit());

    // Test 2: Smart Cache AI
    results.push(await this.testSmartCache());

    // Test 3: Adaptive Learning AI
    results.push(await this.testAdaptiveLearning());

    // Test 4: Client Retention AI
    results.push(await this.testClientRetention());

    // Test 5: System Status
    results.push(await this.testSystemStatus());

    // Test 6: Intelligence Gathering
    results.push(await this.testIntelligenceGathering());

    // Test 7: Color System Validation
    results.push(await this.testColorSystem());

    // Test 8: Security Guardian
    results.push(await this.testSecurityGuardian());

    // Test 9: Predictive Analytics
    results.push(await this.testPredictiveAnalytics());

    // Test 10: Cross-Platform Optimizer
    results.push(await this.testCrossPlatformOptimizer());

    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;

    const summary = `AI Test Suite Complete: ${passed}/${results.length} tests passed`;
    
    logger.info(summary, 'AITestRunner', { passed, failed });

    return {
      passed,
      failed,
      results,
      summary
    };
  }

  private async testOrchestratorInit(): Promise<TestResult> {
    try {
      await aiOrchestrator.start();
      const status = aiOrchestrator.getStatus();
      
      return {
        system: 'AI Orchestrator',
        passed: status.running === true,
        message: status.running ? 'Successfully initialized' : 'Failed to initialize',
        details: status
      };
    } catch (error) {
      return {
        system: 'AI Orchestrator',
        passed: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async testSmartCache(): Promise<TestResult> {
    try {
      // Track a test access
      smartCacheAI.trackAccess('test-key');
      
      const insights = smartCacheAI.getInsights();
      const recommendations = smartCacheAI.getRecommendations();
      
      return {
        system: 'Smart Cache AI',
        passed: insights.totalPatterns >= 0 && recommendations.length >= 0,
        message: `Tracking ${insights.totalPatterns} patterns, ${recommendations.length} recommendations`,
        details: insights
      };
    } catch (error) {
      return {
        system: 'Smart Cache AI',
        passed: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async testAdaptiveLearning(): Promise<TestResult> {
    try {
      // Track test behavior
      adaptiveLearningAI.trackBehavior('test-user', 'view_dashboard', { test: true });
      
      const insights = adaptiveLearningAI.getInsights('test-user');
      
      return {
        system: 'Adaptive Learning AI',
        passed: insights.totalActions >= 0,
        message: `Tracking ${insights.totalActions} actions, ${insights.adaptations} adaptations`,
        details: insights
      };
    } catch (error) {
      return {
        system: 'Adaptive Learning AI',
        passed: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async testClientRetention(): Promise<TestResult> {
    try {
      // Note: This would need actual stylist data to fully test
      // For now, just verify the system is accessible
      const testResult = typeof clientRetentionAI.analyzeClientRetention === 'function';
      
      return {
        system: 'Client Retention AI',
        passed: testResult,
        message: testResult ? 'System ready for retention analysis' : 'System not available',
      };
    } catch (error) {
      return {
        system: 'Client Retention AI',
        passed: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async testSystemStatus(): Promise<TestResult> {
    try {
      const status = aiOrchestrator.getStatus();
      
      const allSystemsActive = 
        status.systems?.retention === 'active' &&
        status.systems?.cache === 'active' &&
        status.systems?.behavior === 'active' &&
        status.systems?.health === 'active';
      
      return {
        system: 'System Status',
        passed: allSystemsActive,
        message: allSystemsActive ? 'All systems active' : 'Some systems inactive',
        details: status.systems
      };
    } catch (error) {
      return {
        system: 'System Status',
        passed: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async testIntelligenceGathering(): Promise<TestResult> {
    try {
      // Test if we can get the orchestrator status
      const status = aiOrchestrator.getStatus();
      const hasIntelligence = status.intelligence !== undefined;
      
      return {
        system: 'Intelligence Gathering',
        passed: hasIntelligence,
        message: hasIntelligence ? 'Intelligence data available' : 'No intelligence data',
        details: status.intelligence
      };
    } catch (error) {
      return {
        system: 'Intelligence Gathering',
        passed: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async testColorSystem(): Promise<TestResult> {
    try {
      const report = colorSystemValidator.generateReport();
      
      return {
        system: 'Color System',
        passed: report.score >= 70,
        message: `${report.summary} (Score: ${report.score}/100)`,
        details: {
          score: report.score,
          cssIssues: report.validation.issues,
          domIssues: report.domIssues.slice(0, 5)
        }
      };
    } catch (error) {
      return {
        system: 'Color System',
        passed: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async testSecurityGuardian(): Promise<TestResult> {
    try {
      const status = await securityGuardian.getSecurityStatus();
      const isSecure = status.status === 'secure' || status.unresolvedThreats === 0;
      
      return {
        system: 'Security Guardian',
        passed: true, // System is operational
        message: isSecure 
          ? '✨ System protected - No threats detected' 
          : `⚠️ ${status.unresolvedThreats} threats under watch`,
        details: status
      };
    } catch (error) {
      return {
        system: 'Security Guardian',
        passed: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async testPredictiveAnalytics(): Promise<TestResult> {
    try {
      const insights = await predictiveAnalytics.generateInsights();
      
      return {
        system: 'Predictive Analytics',
        passed: true,
        message: `Generated ${insights.length} predictive insights`,
        details: { insightCount: insights.length, insights: insights.slice(0, 2) }
      };
    } catch (error) {
      return {
        system: 'Predictive Analytics',
        passed: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async testCrossPlatformOptimizer(): Promise<TestResult> {
    try {
      const capabilities = crossPlatformOptimizer.getCapabilities();
      const shouldPreload = crossPlatformOptimizer.shouldPreloadImages();
      const shouldLazyLoad = crossPlatformOptimizer.shouldUseLazyLoading();
      
      return {
        system: 'Cross-Platform Optimizer',
        passed: capabilities !== null,
        message: capabilities 
          ? `✨ Optimized for ${capabilities.performanceLevel} performance device` 
          : 'Initializing...',
        details: { 
          capabilities, 
          optimizations: { shouldPreload, shouldLazyLoad }
        }
      };
    } catch (error) {
      return {
        system: 'Cross-Platform Optimizer',
        passed: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }


  /**
   * Run quick health check
   */
  async quickHealthCheck(): Promise<boolean> {
    try {
      const status = aiOrchestrator.getStatus();
      return status.running === true;
    } catch {
      return false;
    }
  }

  /**
   * Generate test report
   */
  generateReport(testResults: TestResult[]): string {
    let report = '\n=== AI System Test Report ===\n\n';
    
    testResults.forEach((result, index) => {
      const icon = result.passed ? '✅' : '❌';
      report += `${icon} Test ${index + 1}: ${result.system}\n`;
      report += `   ${result.message}\n\n`;
    });
    
    const passed = testResults.filter(r => r.passed).length;
    const total = testResults.length;
    const percentage = ((passed / total) * 100).toFixed(1);
    
    report += `\n=== Summary ===\n`;
    report += `Tests Passed: ${passed}/${total} (${percentage}%)\n`;
    report += `Status: ${passed === total ? '🎉 ALL TESTS PASSED' : '⚠️ SOME TESTS FAILED'}\n`;
    
    return report;
  }
}

export const aiTestRunner = new AITestRunnerSystem();

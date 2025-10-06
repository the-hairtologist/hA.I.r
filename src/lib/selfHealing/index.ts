/**
 * Self-Healing System - Main Entry Point
 * 
 * Orchestrates all self-healing and maintenance systems.
 */

import { errorRecovery, withRecovery } from './ErrorRecovery';
import { healthMonitor } from './HealthMonitor';
import { aiMaintenance } from './AIMaintenanceAssistant';
import { dataIntegrity } from './DataIntegrityChecker';
import { logger } from '@/lib/logger';

class SelfHealingSystem {
  private initialized = false;

  /**
   * Initialize all self-healing systems
   */
  async initialize() {
    if (this.initialized) {
      logger.info('Self-healing system already initialized');
      return;
    }

    logger.info('Initializing self-healing system...');

    try {
      // Start health monitoring
      healthMonitor.startMonitoring();

      // Run initial integrity check
      const issues = await dataIntegrity.runFullCheck();
      
      if (issues.length > 0) {
        logger.warn(`Found ${issues.length} data integrity issues on startup`);
        
        // Auto-fix what we can
        const fixed = await dataIntegrity.autoFix(issues);
        logger.info(`Auto-fixed ${fixed} issues`);
      }

      this.initialized = true;
      logger.info('Self-healing system initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize self-healing system', 'SelfHealingSystem', error);
    }
  }

  /**
   * Shutdown all systems
   */
  shutdown() {
    healthMonitor.stopMonitoring();
    this.initialized = false;
    logger.info('Self-healing system shut down');
  }

  /**
   * Get system status
   */
  getStatus() {
    return {
      initialized: this.initialized,
      health: healthMonitor.getHealthStatus(),
      errorRecovery: errorRecovery.getHealthStatus(),
    };
  }

  /**
   * Run manual maintenance
   */
  async runMaintenance() {
    logger.info('Running manual maintenance...');

    // Check health
    await healthMonitor.checkNow();

    // Check data integrity
    const issues = await dataIntegrity.runFullCheck();
    const orphans = await dataIntegrity.checkOrphanedRecords();
    
    const allIssues = [...issues, ...orphans];

    // Auto-fix what we can
    if (allIssues.length > 0) {
      await dataIntegrity.autoFix(allIssues);
    }

    // Generate report
    const report = await dataIntegrity.generateReport();
    logger.info('Maintenance report generated', 'SelfHealingSystem', { report });

    return {
      issuesFound: allIssues.length,
      issuesFixed: allIssues.filter(i => i.autoFixable).length,
      report,
    };
  }

  /**
   * Analyze error with AI
   */
  async analyzeError(error: Error, context?: any) {
    return await aiMaintenance.analyzeError(
      error.message,
      error.stack,
      context
    );
  }

  /**
   * Get AI maintenance insights
   */
  async getMaintenanceInsights() {
    const logs = logger.getRecentLogs(100);
    const errorLogs = logs.filter(log => log.level === 'ERROR');
    const health = healthMonitor.getHealthStatus();

    return await aiMaintenance.generateMaintenanceReport(
      errorLogs,
      health.metrics || {}
    );
  }
}

// Export singleton instance
export const selfHealing = new SelfHealingSystem();

// Export individual systems for direct access
export {
  errorRecovery,
  withRecovery,
  healthMonitor,
  aiMaintenance,
  dataIntegrity,
};

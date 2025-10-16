/**
 * CEO-Level Preventive Maintenance System
 * Runs automatic checks to catch issues before they become problems
 */

import { errorDetection } from './errorDetection';
import { dependencyValidator } from './dependencyValidator';

interface MaintenanceCheck {
  name: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  check: () => Promise<{ passed: boolean; message: string }>;
}

class PreventiveMaintenanceSystem {
  private checks: MaintenanceCheck[] = [];
  private lastRun: Date | null = null;
  private checkInterval: number = 60000; // 1 minute

  constructor() {
    this.registerCoreChecks();
  }

  /**
   * Register core maintenance checks
   */
  private registerCoreChecks(): void {
    // Check 1: Verify no circular dependencies
    this.addCheck({
      name: 'Circular Dependency Check',
      severity: 'critical',
      check: async () => {
        const cycles = dependencyValidator.detectCircularDependencies();
        return {
          passed: cycles.length === 0,
          message: cycles.length > 0 
            ? `Found ${cycles.length} circular dependencies`
            : 'No circular dependencies detected',
        };
      },
    });

    // Check 2: Verify error detection system health
    this.addCheck({
      name: 'Error Detection Health',
      severity: 'high',
      check: async () => {
        const health = errorDetection.healthCheck();
        return {
          passed: health.healthy,
          message: health.healthy 
            ? 'Error detection system healthy'
            : `${health.criticalErrors} critical errors detected`,
        };
      },
    });

    // Check 3: Verify console has no errors
    this.addCheck({
      name: 'Console Error Check',
      severity: 'medium',
      check: async () => {
        const errors = errorDetection.getErrors();
        const consoleErrors = errors.filter(e => e.type === 'runtime-error');
        return {
          passed: consoleErrors.length === 0,
          message: consoleErrors.length > 0
            ? `${consoleErrors.length} console errors detected`
            : 'No console errors',
        };
      },
    });

    // Check 4: Verify localStorage is available
    this.addCheck({
      name: 'LocalStorage Availability',
      severity: 'high',
      check: async () => {
        try {
          localStorage.setItem('__test__', 'test');
          localStorage.removeItem('__test__');
          return { passed: true, message: 'localStorage available' };
        } catch {
          return { passed: false, message: 'localStorage unavailable' };
        }
      },
    });

    // Check 5: Verify critical CSS loaded
    this.addCheck({
      name: 'Critical CSS Check',
      severity: 'medium',
      check: async () => {
        const hasCriticalCSS = !!document.getElementById('critical-css');
        return {
          passed: hasCriticalCSS,
          message: hasCriticalCSS 
            ? 'Critical CSS loaded'
            : 'Critical CSS not loaded',
        };
      },
    });
  }

  /**
   * Add a custom check
   */
  addCheck(check: MaintenanceCheck): void {
    this.checks.push(check);
  }

  /**
   * Run all maintenance checks
   */
  async runChecks(): Promise<{
    passed: number;
    failed: number;
    total: number;
    results: Array<{ name: string; passed: boolean; message: string; severity: string }>;
  }> {
    const results = await Promise.all(
      this.checks.map(async (check) => {
        const result = await check.check();
        return {
          name: check.name,
          passed: result.passed,
          message: result.message,
          severity: check.severity,
        };
      })
    );

    this.lastRun = new Date();

    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;

    // Log results
    if (failed > 0) {
      console.warn('⚠️ Preventive Maintenance: Some checks failed', results.filter(r => !r.passed));
    } else {
      console.log('✅ Preventive Maintenance: All checks passed');
    }

    return {
      passed,
      failed,
      total: results.length,
      results,
    };
  }

  /**
   * Start automatic maintenance checks
   */
  startAutoMaintenance(): void {
    // Run immediately
    this.runChecks();

    // Then run on interval
    setInterval(() => {
      this.runChecks();
    }, this.checkInterval);

    console.log('🔄 Preventive Maintenance: Auto-checks started');
  }

  /**
   * Get last run time
   */
  getLastRunTime(): Date | null {
    return this.lastRun;
  }

  /**
   * Generate maintenance report
   */
  async generateReport(): Promise<string> {
    const results = await this.runChecks();
    
    let report = '=== Preventive Maintenance Report ===\n\n';
    report += `Date: ${new Date().toISOString()}\n`;
    report += `Total Checks: ${results.total}\n`;
    report += `Passed: ${results.passed} ✅\n`;
    report += `Failed: ${results.failed} ❌\n\n`;

    if (results.failed > 0) {
      report += 'Failed Checks:\n';
      results.results
        .filter(r => !r.passed)
        .forEach((result, i) => {
          report += `${i + 1}. [${result.severity.toUpperCase()}] ${result.name}: ${result.message}\n`;
        });
      report += '\n';
    }

    report += 'All Checks:\n';
    results.results.forEach((result, i) => {
      const status = result.passed ? '✅' : '❌';
      report += `${i + 1}. ${status} ${result.name}: ${result.message}\n`;
    });

    return report;
  }
}

export const preventiveMaintenance = new PreventiveMaintenanceSystem();

/**
 * Initialize preventive maintenance
 */
export function initializePreventiveMaintenance(): void {
  preventiveMaintenance.startAutoMaintenance();
  console.log('✅ Preventive Maintenance System initialized');
}

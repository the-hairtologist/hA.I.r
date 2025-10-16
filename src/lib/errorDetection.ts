/**
 * CEO-Level Error Detection & Prevention System
 * Catches issues before they reach production
 */

interface ErrorReport {
  type: 'circular-dependency' | 'import-error' | 'runtime-error' | 'type-error';
  severity: 'critical' | 'high' | 'medium' | 'low';
  file: string;
  message: string;
  stack?: string;
  timestamp: string;
}

class ErrorDetectionSystem {
  private errors: ErrorReport[] = [];
  private importChain: Set<string> = new Set();

  /**
   * Track module imports to detect circular dependencies
   */
  trackImport(modulePath: string): void {
    if (this.importChain.has(modulePath)) {
      this.reportError({
        type: 'circular-dependency',
        severity: 'critical',
        file: modulePath,
        message: `Circular dependency detected: ${Array.from(this.importChain).join(' -> ')} -> ${modulePath}`,
        timestamp: new Date().toISOString(),
      });
    }
    this.importChain.add(modulePath);
  }

  /**
   * Report error to system
   */
  reportError(error: ErrorReport): void {
    this.errors.push(error);
    
    if (error.severity === 'critical') {
      console.error('🚨 CRITICAL ERROR DETECTED:', error);
    }
    
    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring(error);
    }
  }

  /**
   * Get all errors
   */
  getErrors(): ErrorReport[] {
    return this.errors;
  }

  /**
   * Check system health
   */
  healthCheck(): { healthy: boolean; criticalErrors: number; totalErrors: number } {
    const criticalErrors = this.errors.filter(e => e.severity === 'critical').length;
    return {
      healthy: criticalErrors === 0,
      criticalErrors,
      totalErrors: this.errors.length,
    };
  }

  /**
   * Clear all errors
   */
  clearErrors(): void {
    this.errors = [];
    this.importChain.clear();
  }

  /**
   * Send to monitoring service
   */
  private sendToMonitoring(error: ErrorReport): void {
    // Integrate with Sentry, LogRocket, etc.
    try {
      fetch('/api/error-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(error),
      }).catch(() => {
        // Silently fail - don't crash on monitoring failure
      });
    } catch {
      // Silently fail
    }
  }
}

export const errorDetection = new ErrorDetectionSystem();

/**
 * Safe import wrapper - catches import errors
 */
export function safeImport<T>(
  importer: () => T,
  fallback: T,
  moduleName: string
): T {
  try {
    return importer();
  } catch (error) {
    errorDetection.reportError({
      type: 'import-error',
      severity: 'high',
      file: moduleName,
      message: `Failed to import ${moduleName}: ${error}`,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    return fallback;
  }
}

/**
 * Safe function wrapper - catches runtime errors
 */
export function safeExecute<T>(
  fn: () => T,
  fallback: T,
  context: string
): T {
  try {
    return fn();
  } catch (error) {
    errorDetection.reportError({
      type: 'runtime-error',
      severity: 'medium',
      file: context,
      message: `Runtime error in ${context}: ${error}`,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    return fallback;
  }
}

/**
 * Initialize global error handlers
 */
export function initializeErrorDetection(): void {
  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    errorDetection.reportError({
      type: 'runtime-error',
      severity: 'high',
      file: 'unknown',
      message: `Unhandled promise rejection: ${event.reason}`,
      timestamp: new Date().toISOString(),
    });
  });

  // Catch global errors
  window.addEventListener('error', (event) => {
    errorDetection.reportError({
      type: 'runtime-error',
      severity: 'high',
      file: event.filename || 'unknown',
      message: event.message,
      stack: event.error?.stack,
      timestamp: new Date().toISOString(),
    });
  });

  console.log('✅ Error Detection System initialized');
}

/**
 * Production-Safe Logging System
 * Replaces all console.log/error/warn calls with structured logging
 * Following Lovable best practices for zero production overhead
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

interface LogContext {
  component?: string;
  userId?: string;
  action?: string;
  componentStack?: string;
  error?: any;
  [key: string]: any; // Allow any additional context
}

class ProductionLogger {
  private isDevelopment: boolean;
  private logBuffer: Array<{ level: LogLevel; message: string; context?: LogContext; timestamp: number }> = [];
  private maxBufferSize = 100;

  constructor() {
    this.isDevelopment = import.meta.env.DEV;
  }

  /**
   * Debug logs - only in development
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(`[DEBUG] ${message}`, context);
    }
  }

  /**
   * Info logs - important but not critical
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, context);
    }
    this.bufferLog('info', message, context);
  }

  /**
   * Warning logs - potential issues
   */
  warn(message: string, context?: LogContext): void {
    console.warn(`[WARN] ${message}`, context);
    this.bufferLog('warn', message, context);
  }

  /**
   * Error logs - critical issues
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorDetails = error instanceof Error 
      ? { message: error.message, stack: error.stack, name: error.name }
      : { error };
    
    console.error(`[ERROR] ${message}`, { ...context, error: errorDetails });
    this.bufferLog('error', message, { ...context, error: errorDetails });
    
    // Send to monitoring service in production
    if (!this.isDevelopment) {
      this.sendToMonitoring('error', message, { ...context, error: errorDetails });
    }
  }

  /**
   * Fatal logs - application-breaking issues
   */
  fatal(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorDetails = error instanceof Error
      ? { message: error.message, stack: error.stack, name: error.name }
      : { error };

    console.error(`[FATAL] ${message}`, { ...context, error: errorDetails });
    this.bufferLog('fatal', message, { ...context, error: errorDetails });
    
    // Always send fatal errors to monitoring
    this.sendToMonitoring('fatal', message, { ...context, error: errorDetails });
  }

  /**
   * Performance logging
   */
  performance(label: string, duration: number, context?: LogContext): void {
    if (this.isDevelopment && duration > 100) {
      console.warn(`[PERFORMANCE] ${label} took ${duration}ms`, context);
    }
    
    // Only log slow operations in production
    if (!this.isDevelopment && duration > 1000) {
      this.bufferLog('warn', `Slow operation: ${label} (${duration}ms)`, context);
    }
  }

  /**
   * API call logging
   */
  api(method: string, endpoint: string, status: number, duration: number, context?: LogContext): void {
    const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
    const message = `${method} ${endpoint} - ${status} (${duration}ms)`;
    
    if (this.isDevelopment) {
      console.log(`[API] ${message}`, context);
    }
    
    if (level !== 'info') {
      this.bufferLog(level, message, context);
    }
  }

  /**
   * User action logging for analytics
   */
  userAction(action: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(`[USER ACTION] ${action}`, context);
    }
    
    this.bufferLog('info', `User action: ${action}`, context);
  }

  /**
   * Buffer logs for batched sending
   */
  private bufferLog(level: LogLevel, message: string, context?: LogContext): void {
    this.logBuffer.push({
      level,
      message,
      context,
      timestamp: Date.now()
    });

    // Trim buffer if too large
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer = this.logBuffer.slice(-this.maxBufferSize);
    }
  }

  /**
   * Send critical logs to monitoring service
   */
  private sendToMonitoring(level: LogLevel, message: string, context?: LogContext): void {
    try {
      // In production, send to your monitoring service (Sentry, LogRocket, etc.)
      if (window.Sentry) {
        window.Sentry.captureMessage(message, {
          level: level as any,
          extra: context
        });
      }
    } catch (e) {
      // Fail silently - don't break app because of logging
    }
  }

  /**
   * Get buffered logs for debugging
   */
  getBufferedLogs(): typeof this.logBuffer {
    return [...this.logBuffer];
  }

  /**
   * Clear log buffer
   */
  clearBuffer(): void {
    this.logBuffer = [];
  }
}

// Export singleton instance
export const logger = new ProductionLogger();

// Convenience exports
export const logDebug = logger.debug.bind(logger);
export const logInfo = logger.info.bind(logger);
export const logWarn = logger.warn.bind(logger);
export const logError = logger.error.bind(logger);
export const logFatal = logger.fatal.bind(logger);
export const logPerformance = logger.performance.bind(logger);
export const logApi = logger.api.bind(logger);
export const logUserAction = logger.userAction.bind(logger);

// TypeScript augmentation for Sentry
declare global {
  interface Window {
    Sentry?: {
      captureMessage: (message: string, options?: any) => void;
      captureException: (error: Error, options?: any) => void;
    };
  }
}

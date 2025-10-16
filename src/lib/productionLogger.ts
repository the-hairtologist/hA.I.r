/**
 * Production-Safe Logger
 * 
 * Only logs in development mode, silent in production.
 * Prevents console pollution and potential information disclosure.
 */

const isDevelopment = import.meta.env.DEV;

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

interface LogOptions {
  context?: string;
  data?: any;
}

class ProductionLogger {
  private shouldLog(level: LogLevel): boolean {
    if (!isDevelopment) {
      // In production, only log errors
      return level === 'error';
    }
    return true;
  }

  private formatMessage(message: string, options?: LogOptions): string {
    const prefix = options?.context ? `[${options.context}]` : '';
    return `${prefix} ${message}`.trim();
  }

  log(message: string, options?: LogOptions): void {
    if (this.shouldLog('log')) {
      console.log(this.formatMessage(message, options), options?.data || '');
    }
  }

  info(message: string, options?: LogOptions): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage(message, options), options?.data || '');
    }
  }

  warn(message: string, options?: LogOptions): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage(message, options), options?.data || '');
    }
  }

  error(message: string, error?: Error | unknown, options?: LogOptions): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage(message, options), error || '', options?.data || '');
      
      // In production, send to error tracking service
      if (!isDevelopment && typeof window !== 'undefined') {
        // Hook for Sentry, LogRocket, etc.
        try {
          // window.Sentry?.captureException(error);
        } catch (e) {
          // Silently fail
        }
      }
    }
  }

  debug(message: string, options?: LogOptions): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage(message, options), options?.data || '');
    }
  }

  /**
   * Group logs together (only in development)
   */
  group(label: string, callback: () => void): void {
    if (isDevelopment) {
      console.group(label);
      callback();
      console.groupEnd();
    } else {
      callback();
    }
  }

  /**
   * Performance timing (only in development)
   */
  time(label: string): void {
    if (isDevelopment) {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (isDevelopment) {
      console.timeEnd(label);
    }
  }

  /**
   * Table display (only in development)
   */
  table(data: any): void {
    if (isDevelopment) {
      console.table(data);
    }
  }
}

// Singleton instance
export const logger = new ProductionLogger();

// Export for backward compatibility
export default logger;

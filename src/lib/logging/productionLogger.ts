/**
 * Production-Safe Logging System
 * Replaces all console.log/error/warn calls with structured logging
 * Following Lovable best practices for zero production overhead
 */

import { safeConsole } from '@/lib/safeLogger';

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

interface LogContext {
  component?: string;
  userId?: string;
  action?: string;
  componentStack?: string;
  error?: any;
  [key: string]: any; // Allow any additional context
}

// PII patterns for detection and redaction
const PII_PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /\b(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
};

class ProductionLogger {
  private isDevelopment: boolean;
  private logBuffer: Array<{
    level: LogLevel;
    message: string;
    context?: LogContext;
    timestamp: number;
  }> = [];
  private maxBufferSize = 100;

  constructor() {
    this.isDevelopment = import.meta.env.DEV;
  }

  /**
   * Scrubs PII (Personally Identifiable Information) from strings
   */
  private scrubPII(text: string): string {
    if (!text || typeof text !== 'string') return text;

    let scrubbed = text;
    scrubbed = scrubbed.replace(PII_PATTERNS.email, '[EMAIL_REDACTED]');
    scrubbed = scrubbed.replace(PII_PATTERNS.phone, '[PHONE_REDACTED]');
    scrubbed = scrubbed.replace(PII_PATTERNS.ssn, '[SSN_REDACTED]');
    scrubbed = scrubbed.replace(PII_PATTERNS.creditCard, '[CARD_REDACTED]');
    return scrubbed;
  }

  /**
   * Scrubs sensitive data from log context
   */
  private scrubSensitiveData(data: any): any {
    if (!data) return data;

    // Scrub strings for PII
    if (typeof data === 'string') {
      return this.scrubPII(data);
    }

    if (typeof data !== 'object') return data;

    const scrubbed = Array.isArray(data) ? [...data] : { ...data };
    const sensitiveKeys = [
      'password',
      'token',
      'secret',
      'authorization',
      'api_key',
      'apiKey',
      'access_token',
      'refresh_token',
      'credit_card',
      'creditCard',
      'ssn',
      'social_security',
      'passport',
      'drivers_license',
    ];

    const traverse = (obj: any): any => {
      if (!obj || typeof obj !== 'object') {
        if (typeof obj === 'string') {
          return this.scrubPII(obj);
        }
        return obj;
      }

      Object.keys(obj).forEach(key => {
        const lowerKey = key.toLowerCase();

        // Redact sensitive keys completely
        if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
          obj[key] = '[REDACTED]';
        }
        // Mask email partially (keep first 2 chars)
        else if (lowerKey.includes('email') && typeof obj[key] === 'string') {
          const email = obj[key];
          if (email.includes('@')) {
            const [local, domain] = email.split('@');
            obj[key] = `${local.substring(0, 2)}***@${domain}`;
          }
        }
        // Mask phone partially (keep last 4 digits)
        else if (lowerKey.includes('phone') && typeof obj[key] === 'string') {
          obj[key] = `***${obj[key].slice(-4)}`;
        }
        // Recursively scrub nested objects
        else if (typeof obj[key] === 'object') {
          obj[key] = traverse(obj[key]);
        }
        // Scrub string values for PII
        else if (typeof obj[key] === 'string') {
          obj[key] = this.scrubPII(obj[key]);
        }
      });

      return obj;
    };

    return traverse(scrubbed);
  }

  /**
   * Debug logs - only in development
   */
  debug(message: string, context?: LogContext): void {
    safeConsole.debug(`[DEBUG] ${message}`, context);
  }

  /**
   * Info logs - important but not critical
   */
  info(message: string, context?: LogContext): void {
    const scrubbedMessage = this.scrubPII(message);
    const scrubbedContext = this.scrubSensitiveData(context);

    safeConsole.info(`[INFO] ${scrubbedMessage}`, scrubbedContext);
    this.bufferLog('info', scrubbedMessage, scrubbedContext);
  }

  /**
   * Warning logs - potential issues
   */
  warn(message: string, context?: LogContext): void {
    const scrubbedMessage = this.scrubPII(message);
    const scrubbedContext = this.scrubSensitiveData(context);

    safeConsole.warn(`[WARN] ${scrubbedMessage}`, scrubbedContext);
    this.bufferLog('warn', scrubbedMessage, scrubbedContext);
  }

  /**
   * Error logs - critical issues
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const scrubbedMessage = this.scrubPII(message);
    const errorDetails =
      error instanceof Error
        ? { message: error.message, stack: error.stack, name: error.name }
        : { error };

    const scrubbedContext = this.scrubSensitiveData({
      ...context,
      error: errorDetails,
    });

    safeConsole.error(`[ERROR] ${scrubbedMessage}`, scrubbedContext);
    this.bufferLog('error', scrubbedMessage, scrubbedContext);

    // Send to monitoring service in production
    if (!this.isDevelopment) {
      this.sendToMonitoring('error', scrubbedMessage, scrubbedContext);
    }
  }

  /**
   * Fatal logs - application-breaking issues
   */
  fatal(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorDetails =
      error instanceof Error
        ? { message: error.message, stack: error.stack, name: error.name }
        : { error };

    safeConsole.error(`[FATAL] ${message}`, {
      ...context,
      error: errorDetails,
    });
    this.bufferLog('fatal', message, { ...context, error: errorDetails });

    // Always send fatal errors to monitoring
    this.sendToMonitoring('fatal', message, {
      ...context,
      error: errorDetails,
    });
  }

  /**
   * Performance logging
   */
  performance(label: string, duration: number, context?: LogContext): void {
    if (duration > 100) {
      safeConsole.warn(`[PERFORMANCE] ${label} took ${duration}ms`, context);
    }

    // Only log slow operations in production
    if (!this.isDevelopment && duration > 1000) {
      this.bufferLog(
        'warn',
        `Slow operation: ${label} (${duration}ms)`,
        context
      );
    }
  }

  /**
   * API call logging
   */
  api(
    method: string,
    endpoint: string,
    status: number,
    duration: number,
    context?: LogContext
  ): void {
    const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
    const message = `${method} ${endpoint} - ${status} (${duration}ms)`;

    safeConsole.log(`[API] ${message}`, context);

    if (level !== 'info') {
      this.bufferLog(level, message, context);
    }
  }

  /**
   * User action logging for analytics
   */
  userAction(action: string, context?: LogContext): void {
    safeConsole.log(`[USER ACTION] ${action}`, context);
    this.bufferLog('info', `User action: ${action}`, context);
  }

  /**
   * Buffer logs for batched sending
   */
  private bufferLog(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): void {
    this.logBuffer.push({
      level,
      message,
      context,
      timestamp: Date.now(),
    });

    // Trim buffer if too large
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer = this.logBuffer.slice(-this.maxBufferSize);
    }
  }

  /**
   * Send critical logs to monitoring service
   */
  private sendToMonitoring(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): void {
    try {
      // In production, send to your monitoring service (Sentry, LogRocket, etc.)
      if (window.Sentry) {
        window.Sentry.captureMessage(message, {
          level: level as any,
          extra: context,
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

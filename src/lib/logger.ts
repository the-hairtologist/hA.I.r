/**
 * Centralized Logging Utility
 * 
 * Replaces scattered console.log/warn/error calls with structured logging
 * - Development: Full logging to console
 * - Production: Minimal logging, can integrate with external services
 * - Performance: Batched logging to reduce overhead
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: any;
  error?: Error;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private logBuffer: LogEntry[] = [];
  private maxBufferSize = 100;

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) return true;
    // In production, only log warnings and errors
    return level === 'warn' || level === 'error';
  }

  private createLogEntry(
    level: LogLevel, 
    message: string, 
    context?: any, 
    error?: Error
  ): LogEntry {
    return {
      timestamp: this.formatTimestamp(),
      level,
      message,
      context,
      error
    };
  }

  private writeToConsole(entry: LogEntry): void {
    const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
    const style = this.getLogStyle(entry.level);

    switch (entry.level) {
      case 'debug':
        console.debug(`%c${prefix}`, style, entry.message, entry.context || '');
        break;
      case 'info':
        console.info(`%c${prefix}`, style, entry.message, entry.context || '');
        break;
      case 'warn':
        console.warn(`%c${prefix}`, style, entry.message, entry.context || '');
        break;
      case 'error':
        console.error(`%c${prefix}`, style, entry.message, entry.context || '', entry.error || '');
        break;
    }
  }

  private getLogStyle(level: LogLevel): string {
    const styles = {
      debug: 'color: #888; font-weight: normal',
      info: 'color: #2196F3; font-weight: bold',
      warn: 'color: #FF9800; font-weight: bold',
      error: 'color: #F44336; font-weight: bold'
    };
    return styles[level];
  }

  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift(); // Remove oldest entry
    }
  }

  /**
   * Log debug information (development only)
   */
  debug(message: string, context?: any): void {
    if (!this.shouldLog('debug')) return;
    const entry = this.createLogEntry('debug', message, context);
    this.writeToConsole(entry);
    this.addToBuffer(entry);
  }

  /**
   * Log informational messages
   */
  info(message: string, context?: any): void {
    if (!this.shouldLog('info')) return;
    const entry = this.createLogEntry('info', message, context);
    this.writeToConsole(entry);
    this.addToBuffer(entry);
  }

  /**
   * Log warning messages
   */
  warn(message: string, context?: any): void {
    if (!this.shouldLog('warn')) return;
    const entry = this.createLogEntry('warn', message, context);
    this.writeToConsole(entry);
    this.addToBuffer(entry);
  }

  /**
   * Log error messages - flexible signature to support all existing usage patterns
   */
  error(message: string, errorOrContext?: any, context?: any): void {
    if (!this.shouldLog('error')) return;
    
    let error: Error | undefined;
    let ctx: any;
    
    // Pattern 1: error(message, Error, context)
    if (errorOrContext instanceof Error) {
      error = errorOrContext;
      ctx = context;
    }
    // Pattern 2: error(message, errorString, context)
    else if (typeof errorOrContext === 'string' && context) {
      error = new Error(errorOrContext);
      ctx = context;
    }
    // Pattern 3: error(message, context) 
    else if (errorOrContext && typeof errorOrContext === 'object' && !context) {
      ctx = errorOrContext;
      error = undefined;
    }
    // Pattern 4: error(message, errorString)
    else if (typeof errorOrContext === 'string') {
      error = new Error(errorOrContext);
      ctx = undefined;
    }
    // Pattern 5: error(message)
    else {
      error = undefined;
      ctx = undefined;
    }
    
    const entry = this.createLogEntry('error', message, ctx, error);
    this.writeToConsole(entry);
    this.addToBuffer(entry);
    
    // In production, could send to error tracking service here
    // Example: Sentry.captureException(error, { tags: ctx });
  }

  /**
   * Get recent logs (useful for debugging)
   */
  getRecentLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logBuffer.filter(entry => entry.level === level);
    }
    return [...this.logBuffer];
  }

  /**
   * Clear log buffer
   */
  clearBuffer(): void {
    this.logBuffer = [];
  }

  /**
   * Group related logs together
   */
  group(label: string, callback: () => void): void {
    if (!this.isDevelopment) return;
    console.group(`📦 ${label}`);
    callback();
    console.groupEnd();
  }

  /**
   * Time a function execution
   */
  time(label: string): () => void {
    if (!this.isDevelopment) return () => {};
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.debug(`⏱️ ${label}`, { duration: `${duration.toFixed(2)}ms` });
    };
  }
}

// Export singleton instance
export const logger = new Logger();

// Convenience exports
export const log = {
  debug: (message: string, context?: any) => logger.debug(message, context),
  info: (message: string, context?: any) => logger.info(message, context),
  warn: (message: string, context?: any) => logger.warn(message, context),
  error: (message: string, errorOrContext?: any, context?: any) => logger.error(message, errorOrContext, context),
  group: (label: string, callback: () => void) => logger.group(label, callback),
  time: (label: string) => logger.time(label)
};

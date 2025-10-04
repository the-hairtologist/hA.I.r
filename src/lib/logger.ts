/**
 * Centralized Logging Utility
 * Provides consistent logging across the application with log levels
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  data?: any;
  timestamp: string;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private logs: LogEntry[] = [];
  private maxLogs = 100; // Keep last 100 logs in memory

  private formatMessage(level: LogLevel, message: string, context?: string, data?: any): LogEntry {
    return {
      level,
      message,
      context,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  private shouldLog(level: LogLevel): boolean {
    // In production, only log WARN and ERROR
    if (!this.isDevelopment) {
      return level === LogLevel.WARN || level === LogLevel.ERROR;
    }
    return true;
  }

  private addToHistory(entry: LogEntry) {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  debug(message: string, context?: string, data?: any) {
    if (!this.shouldLog(LogLevel.DEBUG)) return;

    const entry = this.formatMessage(LogLevel.DEBUG, message, context, data);
    this.addToHistory(entry);

    console.log(
      `%c[${entry.level}]%c ${entry.context ? `[${entry.context}]` : ''} ${entry.message}`,
      'color: #6b7280; font-weight: bold',
      'color: inherit',
      data || ''
    );
  }

  info(message: string, context?: string, data?: any) {
    if (!this.shouldLog(LogLevel.INFO)) return;

    const entry = this.formatMessage(LogLevel.INFO, message, context, data);
    this.addToHistory(entry);

    console.log(
      `%c[${entry.level}]%c ${entry.context ? `[${entry.context}]` : ''} ${entry.message}`,
      'color: #3b82f6; font-weight: bold',
      'color: inherit',
      data || ''
    );
  }

  warn(message: string, context?: string, data?: any) {
    if (!this.shouldLog(LogLevel.WARN)) return;

    const entry = this.formatMessage(LogLevel.WARN, message, context, data);
    this.addToHistory(entry);

    console.warn(
      `%c[${entry.level}]%c ${entry.context ? `[${entry.context}]` : ''} ${entry.message}`,
      'color: #f59e0b; font-weight: bold',
      'color: inherit',
      data || ''
    );
  }

  error(message: string, context?: string, error?: any) {
    const entry = this.formatMessage(LogLevel.ERROR, message, context, error);
    this.addToHistory(entry);

    console.error(
      `%c[${entry.level}]%c ${entry.context ? `[${entry.context}]` : ''} ${entry.message}`,
      'color: #ef4444; font-weight: bold',
      'color: inherit',
      error || ''
    );

    // In production, you could send errors to a logging service here
    // e.g., Sentry, LogRocket, etc.
  }

  // Get recent logs for debugging
  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logs.slice(-count);
  }

  // Clear log history
  clearLogs() {
    this.logs = [];
  }
}

// Export singleton instance
export const logger = new Logger();

// Convenience exports
export const log = {
  debug: (message: string, context?: string, data?: any) => logger.debug(message, context, data),
  info: (message: string, context?: string, data?: any) => logger.info(message, context, data),
  warn: (message: string, context?: string, data?: any) => logger.warn(message, context, data),
  error: (message: string, context?: string, error?: any) => logger.error(message, context, error),
};

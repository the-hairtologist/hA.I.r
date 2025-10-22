/**
 * Centralized Logging System
 * Provides consistent logging across the application
 */

import type { LogLevel, LogEntry, LogContext, LoggerInterface } from '@/types/logger';
import { safeConsole } from '@/lib/safeLogger';

class Logger implements LoggerInterface {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private log(level: LogLevel, message: string, label?: string, context?: LogContext | Error | unknown) {
    // Convert Error objects to LogContext
    let logContext: LogContext | undefined;
    if (context instanceof Error) {
      logContext = {
        name: context.name,
        message: context.message,
        stack: context.stack,
      };
    } else if (context && typeof context === 'object') {
      logContext = context as LogContext;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      label,
      context: logContext,
    };

    this.logs.push(entry);
    
    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    const prefix = label ? `[${label}]` : '';
    const fullMessage = `${prefix} ${message}`;
    const isDevelopment = import.meta.env.DEV;

    // Only output to console in development or for errors
    switch (level) {
      case 'DEBUG':
        if (isDevelopment) {
          safeConsole.debug(fullMessage, logContext);
        }
        break;
      case 'INFO':
        if (isDevelopment) {
          safeConsole.info(fullMessage, logContext);
        }
        break;
      case 'WARN':
        if (isDevelopment) {
          safeConsole.warn(fullMessage, logContext);
        }
        break;
      case 'ERROR':
        // Always log errors
        safeConsole.error(fullMessage, logContext);
        break;
    }
  }

  debug(message: string, label?: string, context?: LogContext) {
    this.log('DEBUG', message, label, context);
  }

  info(message: string, label?: string, context?: LogContext) {
    this.log('INFO', message, label, context);
  }

  warn(message: string, label?: string, context?: LogContext) {
    this.log('WARN', message, label, context);
  }

  error(message: string, label?: string, error?: Error | LogContext | unknown) {
    this.log('ERROR', message, label, error);
  }

  getRecentLogs(count: number = 100): LogEntry[] {
    return this.logs.slice(-count);
  }

  clear() {
    this.logs = [];
  }
}

export const logger = new Logger();

// Backwards compatibility - export both logger and log
export const log = {
  debug: logger.debug.bind(logger),
  info: logger.info.bind(logger),
  warn: logger.warn.bind(logger),
  error: logger.error.bind(logger),
};

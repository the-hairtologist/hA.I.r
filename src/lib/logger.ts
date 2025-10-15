/**
 * Centralized Logging System
 * Provides consistent logging across the application
 */

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  label?: string;
  context?: any;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private log(level: LogLevel, message: string, label?: string, context?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      label,
      context,
    };

    this.logs.push(entry);
    
    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output with color coding
    const prefix = label ? `[${label}]` : '';
    const fullMessage = `${prefix} ${message}`;

    switch (level) {
      case 'DEBUG':
        console.debug(fullMessage, context);
        break;
      case 'INFO':
        console.info(fullMessage, context);
        break;
      case 'WARN':
        console.warn(fullMessage, context);
        break;
      case 'ERROR':
        console.error(fullMessage, context);
        break;
    }
  }

  debug(message: string, label?: string, context?: any) {
    this.log('DEBUG', message, label, context);
  }

  info(message: string, label?: string, context?: any) {
    this.log('INFO', message, label, context);
  }

  warn(message: string, label?: string, context?: any) {
    this.log('WARN', message, label, context);
  }

  error(message: string, label?: string, error?: any) {
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

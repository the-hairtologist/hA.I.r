/**
 * Logger Type Definitions
 */

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogContext {
  [key: string]: string | number | boolean | null | undefined | object | LogContext | LogContext[];
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  label?: string;
  context?: LogContext;
}

export interface LoggerInterface {
  debug(message: string, label?: string, context?: LogContext): void;
  info(message: string, label?: string, context?: LogContext): void;
  warn(message: string, label?: string, context?: LogContext): void;
  error(message: string, label?: string, error?: Error | LogContext): void;
  getRecentLogs(count?: number): LogEntry[];
  clear(): void;
}

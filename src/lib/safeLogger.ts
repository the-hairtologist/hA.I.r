/**
 * Production-Safe Logger
 * Sanitizes sensitive data and only logs in development
 */

const isDevelopment = import.meta.env.DEV;

/**
 * Sanitize data before logging to remove sensitive info
 */
function sanitize(data: any): any {
  if (!data || typeof data !== 'object') return data;

  const sensitiveKeys = [
    'password',
    'token',
    'secret',
    'api_key',
    'apiKey',
    'authorization',
  ];
  const sanitized = { ...data };

  for (const key of Object.keys(sanitized)) {
    if (
      sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))
    ) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitize(sanitized[key]);
    }
  }

  return sanitized;
}

/**
 * Safe console methods that only work in development
 */
export const safeConsole = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args.map(sanitize));
    }
  },

  error: (...args: any[]) => {
    // Always log errors but sanitize them
    console.error(...args.map(sanitize));
  },

  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args.map(sanitize));
    }
  },

  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args.map(sanitize));
    }
  },

  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args.map(sanitize));
    }
  },
};

/**
 * Performance measurement helper
 * Use browser DevTools Performance tab for detailed profiling
 */
export const safePerfMark = (label: string) => {
  if (isDevelopment && 'performance' in window) {
    performance.mark(label);
  }
};

export const safePerfMeasure = (
  name: string,
  startMark: string,
  endMark?: string
) => {
  if (isDevelopment && 'performance' in window) {
    try {
      performance.measure(name, startMark, endMark);
      // Measurements viewable in DevTools Performance tab
    } catch {
      // Mark doesn't exist, ignore
    }
  }
};

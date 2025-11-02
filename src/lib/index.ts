/**
 * Central Export for All Library Utilities
 * Import everything you need from '@/lib'
 */

// Security utilities
export {
  sanitizeHtml,
  sanitizeInput,
  sanitizeEmail,
  sanitizePhone,
  sanitizeUrl,
  sanitizeSqlInput,
  sanitizeFileName,
  detectSQLInjection,
} from './security/inputSanitization';

export { rateLimiter, RATE_LIMITS } from './security/rateLimiter';

// Error handling utilities
export {
  withRetry,
  createRetryWrapper,
  batchRetry,
  type RetryOptions,
} from './errorHandling/retryLogic';

export {
  offlineQueue,
  type QueuedOperation,
} from './errorHandling/offlineQueue';

// Database utilities
export {
  createPaginationParams,
  calculatePaginationRange,
  queryCache,
  createCacheKey,
  batchFetch,
  RECOMMENDED_INDEXES,
  type PaginationParams,
  type PaginationResult,
} from './database/queryOptimization';

// Performance utilities
export {
  compressImage,
  generateSrcSet,
  getOptimalImageSize,
  preloadImage,
  createBlurPlaceholder,
  type ImageOptimizationOptions,
} from './performance/imageOptimization';

// Hooks
export {
  useEnhancedQuery,
  invalidateQueryCache,
} from '@/hooks/useEnhancedQuery';

// Logger
export { logger, log } from './logger';

// Utils
export { cn, responsive } from './utils';

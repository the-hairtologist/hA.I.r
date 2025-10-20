/**
 * Unified Responsive System
 * Single source of truth for all responsive utilities
 */

// Re-export all utilities and constants
export * from './utilities';
export * from './hooks';
export * from './constants';

// Default export for convenience
export { responsiveBestPractices as responsive } from './utilities';

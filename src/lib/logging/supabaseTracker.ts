/**
 * Supabase Query Tracker
 * Wraps Supabase queries to add logging and journey tracking
 */

import { logger } from './productionLogger';
import { userJourney } from './userJourneyTracker';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';

interface QueryOptions {
  table: string;
  operation: 'select' | 'insert' | 'update' | 'delete' | 'rpc';
  component?: string;
  context?: Record<string, any>;
}

/**
 * Track Supabase query performance and log results
 */
export async function trackQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  options: QueryOptions
): Promise<{ data: T | null; error: any }> {
  const startTime = Date.now();
  const { table, operation, component, context } = options;

  try {
    // Execute query
    const result = await queryFn();
    const duration = Date.now() - startTime;

    // Track in user journey
    userJourney.trackApiCall(
      operation.toUpperCase(),
      `/db/${table}`,
      result.error ? 500 : 200,
      duration
    );

    // Log based on result
    if (result.error) {
      logger.error(`${operation} failed on ${table}`, result.error, {
        component,
        table,
        operation,
        duration,
        ...context,
      });
    } else {
      logger.debug(`${operation} succeeded on ${table}`, {
        component,
        table,
        operation,
        duration,
        ...context,
      });

      // Log performance warning for slow queries
      if (duration > 1000) {
        logger.warn(`Slow query detected: ${operation} on ${table}`, {
          component,
          table,
          operation,
          duration,
        });
      }
    }

    // Track performance metrics
    logger.performance(`DB ${operation}`, duration, {
      table,
      component,
      success: !result.error,
    });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error(`${operation} exception on ${table}`, error, {
      component,
      table,
      operation,
      duration,
      ...context,
    });

    userJourney.trackError(error as Error, {
      action: `db-${operation}`,
      table,
      component,
    });

    return { data: null, error };
  }
}

/**
 * Helper for tracking select queries
 */
export function trackSelect<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  table: string,
  component?: string,
  context?: Record<string, any>
) {
  return trackQuery(queryFn, { table, operation: 'select', component, context });
}

/**
 * Helper for tracking insert queries
 */
export function trackInsert<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  table: string,
  component?: string,
  context?: Record<string, any>
) {
  return trackQuery(queryFn, { table, operation: 'insert', component, context });
}

/**
 * Helper for tracking update queries
 */
export function trackUpdate<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  table: string,
  component?: string,
  context?: Record<string, any>
) {
  return trackQuery(queryFn, { table, operation: 'update', component, context });
}

/**
 * Helper for tracking delete queries
 */
export function trackDelete<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  table: string,
  component?: string,
  context?: Record<string, any>
) {
  return trackQuery(queryFn, { table, operation: 'delete', component, context });
}

/**
 * Helper for tracking RPC calls
 */
export function trackRPC<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  functionName: string,
  component?: string,
  context?: Record<string, any>
) {
  return trackQuery(queryFn, { 
    table: functionName, 
    operation: 'rpc', 
    component, 
    context 
  });
}

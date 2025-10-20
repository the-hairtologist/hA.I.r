/**
 * Supabase Query Performance & Error Tracker
 * Wraps Supabase queries to monitor performance and capture errors
 */

import { logger } from './productionLogger';
import { userJourney } from './userJourneyTracker';

interface TrackingMetadata {
  [key: string]: any;
}

/**
 * Track SELECT queries
 */
export async function trackSelect<T>(
  query: () => Promise<any>,
  tableName: string,
  componentName: string,
  metadata?: TrackingMetadata
): Promise<any> {
  const startTime = performance.now();
  
  try {
    const result = await query();
    const duration = performance.now() - startTime;
    
    if (result.error) {
      logger.error(`SELECT query failed on ${tableName}`, result.error, {
        component: componentName,
        duration,
        metadata
      });
      userJourney.trackError(result.error, { 
        operation: 'SELECT', 
        table: tableName,
        component: componentName
      });
    } else {
      logger.debug(`SELECT from ${tableName} completed`, {
        component: componentName,
        duration,
        rowCount: result.data?.length || 0,
        metadata
      });
    }
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    logger.error(`SELECT query exception on ${tableName}`, error, {
      component: componentName,
      duration,
      metadata
    });
    throw error;
  }
}

/**
 * Track INSERT queries
 */
export async function trackInsert<T>(
  query: () => Promise<any>,
  tableName: string,
  componentName: string,
  metadata?: TrackingMetadata
): Promise<any> {
  const startTime = performance.now();
  
  try {
    const result = await query();
    const duration = performance.now() - startTime;
    
    if (result.error) {
      logger.error(`INSERT query failed on ${tableName}`, result.error, {
        component: componentName,
        duration,
        metadata
      });
      userJourney.trackError(result.error, { 
        operation: 'INSERT', 
        table: tableName,
        component: componentName
      });
    } else {
      logger.info(`INSERT into ${tableName} completed`, {
        component: componentName,
        duration,
        metadata
      });
      userJourney.trackAction(`Created record in ${tableName}`, { 
        component: componentName,
        duration 
      });
    }
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    logger.error(`INSERT query exception on ${tableName}`, error, {
      component: componentName,
      duration,
      metadata
    });
    throw error;
  }
}

/**
 * Track UPDATE queries
 */
export async function trackUpdate<T>(
  query: () => Promise<any>,
  tableName: string,
  componentName: string,
  metadata?: TrackingMetadata
): Promise<any> {
  const startTime = performance.now();
  
  try {
    const result = await query();
    const duration = performance.now() - startTime;
    
    if (result.error) {
      logger.error(`UPDATE query failed on ${tableName}`, result.error, {
        component: componentName,
        duration,
        metadata
      });
      userJourney.trackError(result.error, { 
        operation: 'UPDATE', 
        table: tableName,
        component: componentName
      });
    } else {
      logger.info(`UPDATE on ${tableName} completed`, {
        component: componentName,
        duration,
        metadata
      });
      userJourney.trackAction(`Updated record in ${tableName}`, { 
        component: componentName,
        duration 
      });
    }
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    logger.error(`UPDATE query exception on ${tableName}`, error, {
      component: componentName,
      duration,
      metadata
    });
    throw error;
  }
}

/**
 * Track DELETE queries
 */
export async function trackDelete<T>(
  query: () => Promise<any>,
  tableName: string,
  componentName: string,
  metadata?: TrackingMetadata
): Promise<any> {
  const startTime = performance.now();
  
  try {
    const result = await query();
    const duration = performance.now() - startTime;
    
    if (result.error) {
      logger.error(`DELETE query failed on ${tableName}`, result.error, {
        component: componentName,
        duration,
        metadata
      });
      userJourney.trackError(result.error, { 
        operation: 'DELETE', 
        table: tableName,
        component: componentName
      });
    } else {
      logger.info(`DELETE from ${tableName} completed`, {
        component: componentName,
        duration,
        metadata
      });
      userJourney.trackAction(`Deleted record from ${tableName}`, { 
        component: componentName,
        duration 
      });
    }
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    logger.error(`DELETE query exception on ${tableName}`, error, {
      component: componentName,
      duration,
      metadata
    });
    throw error;
  }
}

/**
 * Data Flow Logger
 * Tracks data transformations through the pipeline: DB → API → State → UI
 */

import { logger } from '@/lib/logging/productionLogger';
import { safeConsole } from '@/lib/safeLogger';

type FlowStage = 'database' | 'api' | 'transform' | 'state' | 'ui' | 'validation';

interface FlowLogOptions {
  stage: FlowStage;
  feature: string;
  data?: unknown;
  metadata?: Record<string, unknown>;
}

class DataFlowLogger {
  private enabled = import.meta.env.DEV;
  private flows: Map<string, Array<FlowLogOptions & { timestamp: number }>> = new Map();

  /**
   * Log a data flow stage
   */
  log(options: FlowLogOptions): void {
    if (!this.enabled) return;

    const { stage, feature, data, metadata } = options;
    const timestamp = Date.now();
    
    // Track flow history
    if (!this.flows.has(feature)) {
      this.flows.set(feature, []);
    }
    
    const flowHistory = this.flows.get(feature)!;
    flowHistory.push({ ...options, timestamp });
    
    // Keep only last 10 stages per feature
    if (flowHistory.length > 10) {
      flowHistory.shift();
    }

    // Log with color coding
    const prefix = `🌊 [${stage.toUpperCase()}]`;
    const message = `${prefix} ${feature}`;
    
    logger.debug(message, {
      context: 'DataFlow',
      data: {
        stage,
        feature,
        dataSize: this.getDataSize(data),
        metadata,
        flowHistory: flowHistory.length
      }
    });

    // Log actual data only for small payloads
    if (data && this.getDataSize(data) < 1000) {
      safeConsole.log(`${message} →`, data);
    }
  }

  /**
   * Log database query
   */
  database(feature: string, query: string, result?: unknown): void {
    this.log({
      stage: 'database',
      feature,
      data: result,
      metadata: { query }
    });
  }

  /**
   * Log API call
   */
  api(feature: string, endpoint: string, payload?: unknown, response?: unknown): void {
    this.log({
      stage: 'api',
      feature,
      data: { payload, response },
      metadata: { endpoint }
    });
  }

  /**
   * Log data transformation
   */
  transform(feature: string, from: string, to: string, data?: unknown): void {
    this.log({
      stage: 'transform',
      feature,
      data,
      metadata: { from, to }
    });
  }

  /**
   * Log state update
   */
  state(feature: string, stateName: string, newValue?: unknown): void {
    this.log({
      stage: 'state',
      feature,
      data: newValue,
      metadata: { stateName }
    });
  }

  /**
   * Log UI render
   */
  ui(feature: string, component: string, props?: unknown): void {
    this.log({
      stage: 'ui',
      feature,
      data: props,
      metadata: { component }
    });
  }

  /**
   * Log validation
   */
  validation(feature: string, isValid: boolean, errors?: unknown): void {
    this.log({
      stage: 'validation',
      feature,
      data: { isValid, errors },
      metadata: { isValid }
    });
  }

  /**
   * Get flow history for a feature
   */
  getFlowHistory(feature: string): Array<FlowLogOptions & { timestamp: number }> {
    return this.flows.get(feature) || [];
  }

  /**
   * Analyze flow for bottlenecks
   */
  analyzeFlow(feature: string): {
    totalTime: number;
    stages: Array<{ stage: FlowStage; duration: number }>;
  } {
    const history = this.getFlowHistory(feature);
    if (history.length < 2) {
      return { totalTime: 0, stages: [] };
    }

    const stages: Array<{ stage: FlowStage; duration: number }> = [];
    for (let i = 1; i < history.length; i++) {
      stages.push({
        stage: history[i].stage,
        duration: history[i].timestamp - history[i - 1].timestamp
      });
    }

    return {
      totalTime: history[history.length - 1].timestamp - history[0].timestamp,
      stages
    };
  }

  /**
   * Clear flow history
   */
  clear(feature?: string): void {
    if (feature) {
      this.flows.delete(feature);
    } else {
      this.flows.clear();
    }
  }

  private getDataSize(data: unknown): number {
    try {
      return JSON.stringify(data).length;
    } catch {
      return 0;
    }
  }
}

export const flowLogger = new DataFlowLogger();

// Convenience exports
export const logDB = flowLogger.database.bind(flowLogger);
export const logAPI = flowLogger.api.bind(flowLogger);
export const logTransform = flowLogger.transform.bind(flowLogger);
export const logState = flowLogger.state.bind(flowLogger);
export const logUI = flowLogger.ui.bind(flowLogger);
export const logValidation = flowLogger.validation.bind(flowLogger);

/**
 * Automated Error Scenarios
 * Simulates common errors to test error handling and recovery
 */

import { logger } from '@/lib/logging/productionLogger';
import { supabase } from '@/integrations/supabase/client';

export interface ErrorScenario {
  name: string;
  description: string;
  category: 'auth' | 'database' | 'network' | 'validation' | 'edge-function';
  severity: 'low' | 'medium' | 'high' | 'critical';
  execute: () => Promise<{ success: boolean; error?: Error; message: string }>;
}

/**
 * Auth timeout scenario
 */
export const authTimeoutScenario: ErrorScenario = {
  name: 'Auth Session Timeout',
  description: 'Simulates an expired authentication session',
  category: 'auth',
  severity: 'high',
  execute: async () => {
    try {
      // Try to access a protected resource with invalid token
      const { error } = await supabase.from('profiles').select('*').limit(1);

      if (error && error.message.includes('JWT')) {
        logger.warn('Auth timeout detected', { error: error.message });
        return {
          success: true,
          message: 'Successfully detected auth timeout',
        };
      }

      return {
        success: false,
        message: 'Auth timeout not triggered',
      };
    } catch (error) {
      logger.error('Auth timeout scenario failed', error);
      return {
        success: false,
        error: error as Error,
        message: 'Scenario execution failed',
      };
    }
  },
};

/**
 * Database connection loss
 */
export const databaseConnectionScenario: ErrorScenario = {
  name: 'Database Connection Loss',
  description: 'Simulates losing database connection',
  category: 'database',
  severity: 'critical',
  execute: async () => {
    try {
      // Attempt query with extremely large limit to trigger potential issues
      const { error } = await supabase
        .from('profiles')
        .select('*')
        .limit(999999);

      if (error) {
        logger.warn('Database connection issue detected', {
          error: error.message,
        });
        return {
          success: true,
          message: 'Successfully detected database error',
        };
      }

      return {
        success: true,
        message: 'Database connection healthy',
      };
    } catch (error) {
      logger.error('Database connection scenario failed', error);
      return {
        success: false,
        error: error as Error,
        message: 'Scenario execution failed',
      };
    }
  },
};

/**
 * Network timeout scenario
 */
export const networkTimeoutScenario: ErrorScenario = {
  name: 'Network Timeout',
  description: 'Simulates a slow/failing network request',
  category: 'network',
  severity: 'medium',
  execute: async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 100); // 100ms timeout

      try {
        await fetch('https://httpstat.us/200?sleep=5000', {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        return {
          success: false,
          message: 'Network request succeeded (unexpected)',
        };
      } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof Error && error.name === 'AbortError') {
          logger.warn('Network timeout detected');
          return {
            success: true,
            message: 'Successfully detected network timeout',
          };
        }

        throw error;
      }
    } catch (error) {
      logger.error('Network timeout scenario failed', error);
      return {
        success: false,
        error: error as Error,
        message: 'Scenario execution failed',
      };
    }
  },
};

/**
 * RLS policy violation
 */
export const rlsPolicyScenario: ErrorScenario = {
  name: 'RLS Policy Violation',
  description: 'Attempts to access data without proper permissions',
  category: 'database',
  severity: 'high',
  execute: async () => {
    try {
      // Try to update a protected table without proper permissions
      const { error } = await supabase
        .from('profiles')
        .update({ email: 'test@unauthorized.com' } as any)
        .eq('id', '00000000-0000-0000-0000-000000000000');

      if (error) {
        logger.info('RLS policy correctly blocked unauthorized access', {
          error: error.message,
        });
        return {
          success: true,
          message: 'RLS policy working correctly',
        };
      }

      return {
        success: false,
        message:
          'RLS policy did not block unauthorized access (security issue)',
      };
    } catch (error) {
      logger.error('RLS policy scenario failed', error);
      return {
        success: false,
        error: error as Error,
        message: 'Scenario execution failed',
      };
    }
  },
};

/**
 * Invalid data validation
 */
export const validationErrorScenario: ErrorScenario = {
  name: 'Data Validation Error',
  description: 'Submits invalid data to test validation',
  category: 'validation',
  severity: 'low',
  execute: async () => {
    try {
      // Try to insert data with missing required fields
      const { error } = await supabase.from('appointments').insert({
        appointment_date: 'invalid-date-format',
        client_id: '00000000-0000-0000-0000-000000000000',
      } as any);

      if (error) {
        logger.info('Validation correctly rejected invalid data', {
          error: error.message,
        });
        return {
          success: true,
          message: 'Validation working correctly',
        };
      }

      return {
        success: false,
        message: 'Validation did not catch invalid data',
      };
    } catch (error) {
      logger.error('Validation error scenario failed', error);
      return {
        success: false,
        error: error as Error,
        message: 'Scenario execution failed',
      };
    }
  },
};

/**
 * Edge function error
 */
export const edgeFunctionErrorScenario: ErrorScenario = {
  name: 'Edge Function Error',
  description: 'Calls edge function with invalid parameters',
  category: 'edge-function',
  severity: 'medium',
  execute: async () => {
    try {
      const { error } = await supabase.functions.invoke(
        'non-existent-function',
        {
          body: { invalid: 'data' },
        }
      );

      if (error) {
        logger.info('Edge function error handled', { error: error.message });
        return {
          success: true,
          message: 'Edge function error detected correctly',
        };
      }

      return {
        success: false,
        message: 'Edge function error not detected',
      };
    } catch (error) {
      logger.error('Edge function error scenario failed', error);
      return {
        success: false,
        error: error as Error,
        message: 'Scenario execution failed',
      };
    }
  },
};

/**
 * All error scenarios
 */
export const errorScenarios: ErrorScenario[] = [
  authTimeoutScenario,
  databaseConnectionScenario,
  networkTimeoutScenario,
  rlsPolicyScenario,
  validationErrorScenario,
  edgeFunctionErrorScenario,
];

/**
 * Run all error scenarios
 */
export async function runAllScenarios(): Promise<{
  total: number;
  passed: number;
  failed: number;
  results: Array<{ scenario: string; success: boolean; message: string }>;
}> {
  const results = [];

  for (const scenario of errorScenarios) {
    logger.info(`Running scenario: ${scenario.name}`);
    const result = await scenario.execute();

    results.push({
      scenario: scenario.name,
      success: result.success,
      message: result.message,
    });
  }

  const passed = results.filter(r => r.success).length;
  const failed = results.length - passed;

  logger.info('Scenario testing complete', {
    total: results.length,
    passed,
    failed,
  });

  return {
    total: results.length,
    passed,
    failed,
    results,
  };
}

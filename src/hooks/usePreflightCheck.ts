/**
 * Preflight Check Hook
 * Validate conditions before executing operations
 */

import { useCallback } from 'react';
import { useNetworkStatus, isNetworkSufficientForAI } from './useNetworkStatus';
import { useRateLimitWarning } from './useRateLimitWarning';
import { log } from '@/lib/logger';

export interface PreflightCheckResult {
  passed: boolean;
  checks: {
    name: string;
    passed: boolean;
    message?: string;
  }[];
  blockingIssue?: string;
}

interface PreflightCheckOptions {
  requireNetwork?: boolean;
  requireGoodNetwork?: boolean;
  checkRateLimit?: boolean;
  customChecks?: Array<{
    name: string;
    check: () => boolean | Promise<boolean>;
    message: string;
  }>;
}

/**
 * Hook for running pre-flight validation checks before operations
 */
export function usePreflightCheck() {
  const networkStatus = useNetworkStatus();
  const { canMakeCall, warning } = useRateLimitWarning();

  const checkBeforeAICall = useCallback(
    async (
      options: PreflightCheckOptions = {}
    ): Promise<PreflightCheckResult> => {
      const checks: PreflightCheckResult['checks'] = [];
      let blockingIssue: string | undefined;

      // Network connectivity check
      if (options.requireNetwork !== false) {
        const networkPassed = networkStatus.isOnline;
        checks.push({
          name: 'network_connectivity',
          passed: networkPassed,
          message: networkPassed ? 'Online' : 'No internet connection',
        });

        if (!networkPassed) {
          blockingIssue =
            'You are offline. Please check your internet connection.';
        }
      }

      // Network quality check (for AI operations)
      if (options.requireGoodNetwork && networkStatus.isOnline) {
        const qualityPassed = isNetworkSufficientForAI(networkStatus);
        checks.push({
          name: 'network_quality',
          passed: qualityPassed,
          message: qualityPassed
            ? `Good connection (${networkStatus.quality})`
            : `Slow connection (${networkStatus.quality})`,
        });

        if (!qualityPassed && !blockingIssue) {
          blockingIssue =
            'Connection is too slow for AI features. Try again with better signal.';
        }
      }

      // Rate limit check
      if (options.checkRateLimit !== false) {
        const rateLimitPassed = canMakeCall();
        checks.push({
          name: 'rate_limit',
          passed: rateLimitPassed,
          message: rateLimitPassed
            ? 'Within rate limit'
            : `Rate limit exceeded${warning ? ` (resets in ${Math.ceil(warning.resetIn / 1000)}s)` : ''}`,
        });

        if (!rateLimitPassed && !blockingIssue) {
          blockingIssue = warning
            ? `${warning.message} Try again in ${Math.ceil(warning.resetIn / 1000)} seconds.`
            : 'Rate limit exceeded. Please wait a moment.';
        }
      }

      // Custom checks
      if (options.customChecks) {
        for (const customCheck of options.customChecks) {
          try {
            const checkResult = await customCheck.check();
            checks.push({
              name: customCheck.name,
              passed: checkResult,
              message: checkResult ? 'Passed' : customCheck.message,
            });

            if (!checkResult && !blockingIssue) {
              blockingIssue = customCheck.message;
            }
          } catch (error) {
            checks.push({
              name: customCheck.name,
              passed: false,
              message: `Check failed: ${error}`,
            });

            if (!blockingIssue) {
              blockingIssue = customCheck.message;
            }
          }
        }
      }

      const passed = checks.every(check => check.passed);

      log.info('Preflight check completed', 'usePreflightCheck', {
        passed,
        checks: checks.map(c => ({ name: c.name, passed: c.passed })),
      });

      return {
        passed,
        checks,
        blockingIssue,
      };
    },
    [networkStatus, canMakeCall, warning]
  );

  const checkBeforeImageUpload = useCallback(
    async (file: File, maxSizeMB = 10): Promise<PreflightCheckResult> => {
      return checkBeforeAICall({
        requireNetwork: true,
        customChecks: [
          {
            name: 'file_size',
            check: () => file.size <= maxSizeMB * 1024 * 1024,
            message: `Image too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max size is ${maxSizeMB}MB.`,
          },
          {
            name: 'file_type',
            check: () => file.type.startsWith('image/'),
            message: 'File must be an image (JPG, PNG, etc.)',
          },
        ],
      });
    },
    [checkBeforeAICall]
  );

  const checkBeforeFormSubmit = useCallback(
    async (
      requiredFields: Record<string, any>
    ): Promise<PreflightCheckResult> => {
      return checkBeforeAICall({
        requireNetwork: true,
        checkRateLimit: false,
        customChecks: Object.entries(requiredFields).map(([name, value]) => ({
          name: `field_${name}`,
          check: () => {
            if (typeof value === 'string') return value.trim().length > 0;
            if (Array.isArray(value)) return value.length > 0;
            return value !== null && value !== undefined;
          },
          message: `${name} is required`,
        })),
      });
    },
    [checkBeforeAICall]
  );

  return {
    checkBeforeAICall,
    checkBeforeImageUpload,
    checkBeforeFormSubmit,
  };
}

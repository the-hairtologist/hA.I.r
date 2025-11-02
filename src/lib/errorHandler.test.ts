import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getErrorMessage,
  handleError,
  withRetry,
  validateRequired,
} from './errorHandler';
import { toast } from 'sonner';

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

vi.mock('./logger', () => ({
  log: {
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('errorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getErrorMessage', () => {
    it('should handle null/undefined errors', () => {
      expect(getErrorMessage(null)).toBe('An unexpected error occurred');
      expect(getErrorMessage(undefined)).toBe('An unexpected error occurred');
    });

    it('should handle Supabase error codes', () => {
      const error = { code: 'invalid_credentials', message: 'Bad login' };
      expect(getErrorMessage(error)).toBe('Invalid email or password');
    });

    it('should handle PostgreSQL errors', () => {
      const error = { code: '23505', message: 'violates unique constraint' };
      expect(getErrorMessage(error)).toBe('This record already exists');
    });

    it('should handle auth errors', () => {
      const error = { message: 'Invalid login credentials' };
      expect(getErrorMessage(error)).toBe('Invalid email or password');
    });

    it('should handle Error instances', () => {
      const error = new Error('Custom error message');
      expect(getErrorMessage(error)).toBe('Custom error message');
    });

    it('should handle string errors', () => {
      expect(getErrorMessage('Simple error')).toBe('Simple error');
    });
  });

  describe('handleError', () => {
    it('should create AppError object', async () => {
      const error = new Error('Test error');
      const appError = await handleError(error, 'testContext', {
        showToast: false,
      });

      expect(appError.message).toBe('Test error');
      expect(appError.context).toBe('testContext');
      expect(appError.originalError).toBe(error);
    });

    it('should show toast by default', async () => {
      const error = new Error('Test error');
      await handleError(error, 'testContext');

      expect(toast.error).toHaveBeenCalledWith('Test error');
    });

    it('should not show toast when disabled', async () => {
      const error = new Error('Test error');
      await handleError(error, 'testContext', { showToast: false });

      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should use custom message when provided', async () => {
      const error = new Error('Original');
      const appError = await handleError(error, 'testContext', {
        customMessage: 'Custom message',
        showToast: false,
      });

      expect(appError.message).toBe('Custom message');
    });

    it('should show retry button for retryable errors', async () => {
      const error = new Error('Network error');
      const onRetry = vi.fn();

      await handleError(error, 'testContext', {
        retryable: true,
        onRetry,
      });

      expect(toast.error).toHaveBeenCalledWith('Network error', {
        action: {
          label: 'Retry',
          onClick: onRetry,
        },
        duration: 5000,
      });
    });

    it('should suppress module import errors', async () => {
      const error = new Error('Importing a module script failed');
      await handleError(error, 'testContext');

      expect(toast.error).not.toHaveBeenCalled();
    });
  });

  describe('withRetry', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
      vi.restoreAllMocks();
    });

    it('should retry failed operations', async () => {
      let attempts = 0;
      const operation = vi.fn(async () => {
        attempts++;
        if (attempts < 3) throw new Error('Fail');
        return 'success';
      });

      const promise = withRetry(operation, {
        maxRetries: 3,
        delay: 100,
        backoff: false,
      });

      // Advance timers for retries
      await vi.runAllTimersAsync();

      const result = await promise;
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should throw error after max retries', async () => {
      vi.useFakeTimers();
      const operation = vi.fn().mockRejectedValue(new Error('Always fails'));
      const onRetry = vi.fn();

      await expect(
        withRetry(operation, {
          maxRetries: 3,
          delay: 10,
          backoff: false,
          onRetry,
        })
      ).rejects.toThrow('Always fails');

      expect(operation).toHaveBeenCalledTimes(4); // 1 initial + 3 retries
      expect(onRetry).toHaveBeenCalledTimes(3);
      vi.useRealTimers();
    });

    it('should call onRetry callback', async () => {
      let attempts = 0;
      const operation = vi.fn(async () => {
        attempts++;
        if (attempts < 2) throw new Error('Fail');
        return 'success';
      });

      const onRetry = vi.fn();
      const promise = withRetry(operation, {
        maxRetries: 2,
        delay: 100,
        onRetry,
      });

      await vi.runAllTimersAsync();
      await promise;

      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onRetry).toHaveBeenCalledWith(1);
    });
  });

  describe('validateRequired', () => {
    it('should not throw for valid data', async () => {
      const data = { name: 'Test', email: 'test@example.com' };
      await expect(
        validateRequired(data, ['name', 'email'])
      ).resolves.not.toThrow();
    });

    it('should throw for missing fields', async () => {
      const data = { name: 'Test' };
      await expect(validateRequired(data, ['name', 'email'])).rejects.toThrow(
        'Missing required fields: email'
      );
    });

    it('should handle multiple missing fields', async () => {
      const data = {};
      await expect(
        validateRequired(data, ['name', 'email', 'phone'])
      ).rejects.toThrow('Missing required fields: name, email, phone');
    });
  });
});

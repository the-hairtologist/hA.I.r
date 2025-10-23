/**
 * Unit Tests for useFormSubmit Hook
 * Tests double submission prevention, loading states, error handling, and success scenarios
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useFormSubmit } from './useFormSubmit';
import { toast } from 'sonner';
import { withRetry } from '@/lib/errorHandler';

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('@/lib/errorHandler', () => ({
  withRetry: vi.fn((fn) => fn()),
}));

vi.mock('@/lib/logger', () => ({
  log: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('useFormSubmit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Double Submit Prevention', () => {
    it('should prevent submission within 1 second of last submit', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');
      const { result } = renderHook(() => useFormSubmit(mockFn));
      
      await act(async () => {
        await result.current.handleSubmit();
        await result.current.handleSubmit(); // Immediate second call
      });
      
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(toast.warning).toHaveBeenCalledWith(
        'Please wait for the current submission to complete'
      );
    });

    it('should allow submission after 1 second delay', async () => {
      vi.useFakeTimers();
      const mockFn = vi.fn().mockResolvedValue('success');
      const { result } = renderHook(() => useFormSubmit(mockFn));
      
      await act(async () => {
        await result.current.handleSubmit();
      });
      
      act(() => {
        vi.advanceTimersByTime(1100);
      });
      
      await act(async () => {
        await result.current.handleSubmit();
      });
      
      expect(mockFn).toHaveBeenCalledTimes(2);
      vi.useRealTimers();
    });

    it('should respect preventDoubleSubmit option when false', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');
      const { result } = renderHook(() => 
        useFormSubmit(mockFn, { preventDoubleSubmit: false })
      );
      
      await act(async () => {
        await result.current.handleSubmit();
      });
      
      await act(async () => {
        await result.current.handleSubmit();
      });
      
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('Loading States', () => {
    it('should set isSubmitting to true during submission', async () => {
      const mockFn = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
      const { result } = renderHook(() => useFormSubmit(mockFn));
      
      act(() => {
        result.current.handleSubmit();
      });
      
      expect(result.current.isSubmitting).toBe(true);
      
      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false);
      });
    });

    it('should increment submitCount on each submission', async () => {
      vi.useFakeTimers();
      const mockFn = vi.fn().mockResolvedValue('success');
      const { result } = renderHook(() => useFormSubmit(mockFn));
      
      await act(async () => {
        await result.current.handleSubmit();
      });
      expect(result.current.submitCount).toBe(1);
      
      act(() => vi.advanceTimersByTime(1100));
      
      await act(async () => {
        await result.current.handleSubmit();
      });
      expect(result.current.submitCount).toBe(2);
      
      vi.useRealTimers();
    });
  });

  describe('Error Handling', () => {
    it('should handle errors and show toast', async () => {
      const mockError = new Error('Submission failed');
      const mockFn = vi.fn().mockRejectedValue(mockError);
      const { result } = renderHook(() => 
        useFormSubmit(mockFn, { errorMessage: 'Custom error' })
      );
      
      await act(async () => {
        try {
          await result.current.handleSubmit();
        } catch (e) {
          // Expected to throw
        }
      });
      
      expect(Object.keys(result.current.errors).length).toBeGreaterThan(0);
      expect(toast.error).toHaveBeenCalledWith('Custom error');
    });

    it('should call onError callback on failure', async () => {
      const mockError = new Error('Test error');
      const mockFn = vi.fn().mockRejectedValue(mockError);
      const onError = vi.fn();
      
      const { result } = renderHook(() => 
        useFormSubmit(mockFn, { onError })
      );
      
      await act(async () => {
        try {
          await result.current.handleSubmit();
        } catch (e) {
          // Expected
        }
      });
      
      expect(onError).toHaveBeenCalledWith(mockError);
    });

    it('should clear error with clearError()', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Test'));
      const { result } = renderHook(() => useFormSubmit(mockFn));
      
      await act(async () => {
        try {
          await result.current.handleSubmit();
        } catch (e) {}
      });
      
      expect(Object.keys(result.current.errors).length).toBeGreaterThan(0);
      
      act(() => {
        result.current.clearError();
      });
      
      expect(Object.keys(result.current.errors).length).toBe(0);
    });
  });

  describe('Success Scenarios', () => {
    it('should call onSuccess callback with result', async () => {
      const mockResult = { id: 123, name: 'Test' };
      const mockFn = vi.fn().mockResolvedValue(mockResult);
      const onSuccess = vi.fn();
      
      const { result } = renderHook(() => 
        useFormSubmit(mockFn, { onSuccess })
      );
      
      await act(async () => {
        await result.current.handleSubmit();
      });
      
      expect(onSuccess).toHaveBeenCalledWith(mockResult);
    });

    it('should show success toast when provided', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');
      const { result } = renderHook(() => 
        useFormSubmit(mockFn, { successMessage: 'Success!' })
      );
      
      await act(async () => {
        await result.current.handleSubmit();
      });
      
      expect(toast.success).toHaveBeenCalledWith('Success!');
    });
  });

  describe('Retry Logic', () => {
    it('should use withRetry when enableRetry is true', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');
      (withRetry as any).mockImplementation((fn: any) => fn());
      
      const { result } = renderHook(() => 
        useFormSubmit(mockFn, { enableRetry: true })
      );
      
      await act(async () => {
        await result.current.handleSubmit();
      });
      
      expect(withRetry).toHaveBeenCalledWith(mockFn, expect.any(Object));
    });

    it('should skip retry when enableRetry is false', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');
      
      const { result } = renderHook(() => 
        useFormSubmit(mockFn, { enableRetry: false })
      );
      
      await act(async () => {
        await result.current.handleSubmit();
      });
      
      expect(withRetry).not.toHaveBeenCalled();
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('Reset Functionality', () => {
    it('should reset all state with reset()', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');
      const { result } = renderHook(() => useFormSubmit(mockFn));
      
      await act(async () => {
        await result.current.handleSubmit();
      });
      
      act(() => {
        result.current.reset();
      });
      
      expect(result.current.isSubmitting).toBe(false);
      expect(Object.keys(result.current.errors).length).toBe(0);
    });
  });

  describe('Form Event Handling', () => {
    it('should prevent default on form submit event', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');
      const { result } = renderHook(() => useFormSubmit(mockFn));
      
      const mockEvent = {
        preventDefault: vi.fn(),
      } as any;
      
      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });
  });
});

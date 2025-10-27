/**
 * Integration Test: Double Submit Prevention
 * Tests cross-form double submission prevention and network delay handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { user: { id: 'user-1' } } },
        error: null,
      }),
    },
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      {children}
    </BrowserRouter>
  </QueryClientProvider>
);

describe('Cross-Form Double Submit Prevention', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  describe('useFormSubmit Hook - Core Behavior', () => {
    it('should prevent concurrent submissions', async () => {
      const mockSubmitFn = vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );

      const { useFormSubmit } = await import('@/hooks/useFormSubmit');
      const { result } = await import('@testing-library/react').then(lib => 
        lib.renderHook(() => useFormSubmit(mockSubmitFn), { wrapper: Wrapper })
      );

      // Trigger multiple submissions
      result.current.handleSubmit();
      result.current.handleSubmit();
      result.current.handleSubmit();

      await waitFor(() => {
        expect(mockSubmitFn).toHaveBeenCalledTimes(1);
      });
    });

    it('should prevent double submit within 1 second', async () => {
      const mockSubmitFn = vi.fn().mockResolvedValue(undefined);

      const { useFormSubmit } = await import('@/hooks/useFormSubmit');
      const { result } = await import('@testing-library/react').then(lib => 
        lib.renderHook(() => useFormSubmit(mockSubmitFn), { wrapper: Wrapper })
      );

      // First submission
      await result.current.handleSubmit();
      
      // Immediate second submission (should be blocked)
      await result.current.handleSubmit();

      expect(mockSubmitFn).toHaveBeenCalledTimes(1);
    });

    it('should allow submission after 1 second delay', async () => {
      vi.useFakeTimers();
      const mockSubmitFn = vi.fn().mockResolvedValue(undefined);

      const { useFormSubmit } = await import('@/hooks/useFormSubmit');
      const { result } = await import('@testing-library/react').then(lib => 
        lib.renderHook(() => useFormSubmit(mockSubmitFn), { wrapper: Wrapper })
      );

      // First submission
      await result.current.handleSubmit();
      
      // Wait 1.1 seconds
      vi.advanceTimersByTime(1100);
      
      // Second submission (should be allowed)
      await result.current.handleSubmit();

      expect(mockSubmitFn).toHaveBeenCalledTimes(2);
      
      vi.useRealTimers();
    });
  });

  describe('Network Delay Handling', () => {
    it('should handle 3-second network delay gracefully', async () => {
      vi.useFakeTimers();
      let resolveSubmit: any;
      const submitPromise = new Promise(resolve => {
        resolveSubmit = resolve;
      });

      const mockSubmitFn = vi.fn().mockReturnValue(submitPromise);

      const { useFormSubmit } = await import('@/hooks/useFormSubmit');
      const { result } = await import('@testing-library/react').then(lib => 
        lib.renderHook(() => useFormSubmit(mockSubmitFn), { wrapper: Wrapper })
      );

      // Start submission
      const submitResult = result.current.handleSubmit();
      
      // Verify submitting state
      expect(result.current.isSubmitting).toBe(true);

      // Try to submit again while waiting
      result.current.handleSubmit();
      result.current.handleSubmit();

      // Wait 3 seconds
      vi.advanceTimersByTime(3000);

      // Should still be submitting
      expect(result.current.isSubmitting).toBe(true);
      expect(mockSubmitFn).toHaveBeenCalledTimes(1);

      // Resolve the submission
      resolveSubmit();
      await submitResult;

      // Now should be done
      expect(result.current.isSubmitting).toBe(false);

      vi.useRealTimers();
    });

    it.skip('should retry on network failure', async () => {
      const mockSubmitFn = vi.fn()
        .mockRejectedValueOnce({ message: 'network error' })
        .mockRejectedValueOnce({ message: 'network error' })
        .mockResolvedValueOnce({ success: true });

      const { useFormSubmit } = await import('@/hooks/useFormSubmit');
      const { result } = await import('@testing-library/react').then(lib => 
        lib.renderHook(() => 
          useFormSubmit(mockSubmitFn, { enableRetry: true }), 
          { wrapper: Wrapper }
        )
      );

      await result.current.handleSubmit();

      await waitFor(() => {
        // Should retry twice then succeed
        expect(mockSubmitFn).toHaveBeenCalledTimes(3);
      });
    });
  });

  describe('Form State Management', () => {
    it('should reset state after successful submission', async () =>, { timeout: 15000 } {
      const mockSubmitFn = vi.fn().mockResolvedValue(undefined);

      const { useFormSubmit } = await import('@/hooks/useFormSubmit');
      const { result } = await import('@testing-library/react').then(lib => 
        lib.renderHook(() => useFormSubmit(mockSubmitFn), { wrapper: Wrapper })
      );

      await result.current.handleSubmit();

      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false);
        expect(Object.keys(result.current.errors).length).toBe(0);
      });
    });

    it('should maintain error state after failure', async () =>, { timeout: 15000 } {
      const mockSubmitFn = vi.fn().mockRejectedValue(
        new Error('Submission failed')
      );

      const { useFormSubmit } = await import('@/hooks/useFormSubmit');
      const { result } = await import('@testing-library/react').then(lib => 
        lib.renderHook(() => 
          useFormSubmit(mockSubmitFn, { enableRetry: false }), 
          { wrapper: Wrapper }
        )
      );

      try {
        await result.current.handleSubmit();
      } catch (error) {
        // Expected to throw
      }

      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false);
        expect(Object.keys(result.current.errors).length).toBeGreaterThan(0);
      });
    });

    it('should clear error on manual reset', async () => {
      const mockSubmitFn = vi.fn().mockRejectedValue(
        new Error('Submission failed')
      );

      const { useFormSubmit } = await import('@/hooks/useFormSubmit');
      const { result } = await import('@testing-library/react').then(lib => 
        lib.renderHook(() => 
          useFormSubmit(mockSubmitFn, { enableRetry: false }), 
          { wrapper: Wrapper }
        )
      );

      try {
        await result.current.handleSubmit();
      } catch (error) {
        // Expected
      }

      result.current.reset();

      expect(Object.keys(result.current.errors).length).toBe(0);
      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('Submit Count Tracking', () => {
    it('should track submit attempts', async () =>, { timeout: 15000 } {
      const mockSubmitFn = vi.fn().mockResolvedValue(undefined);

      const { useFormSubmit } = await import('@/hooks/useFormSubmit');
      const { result } = await import('@testing-library/react').then(lib => 
        lib.renderHook(() => useFormSubmit(mockSubmitFn), { wrapper: Wrapper })
      );

      expect(result.current.submitCount).toBe(0);

      await result.current.handleSubmit();
      await waitFor(() => expect(result.current.submitCount).toBe(1));

      // Wait to allow next submission
      await new Promise(resolve => setTimeout(resolve, 1100));

      await result.current.handleSubmit();
      await waitFor(() => expect(result.current.submitCount).toBe(2));
    });
  });

  describe('Accessibility', () => {
    it('should maintain aria-busy state during submission', async () => {
      // This is tested in component-specific tests
      // Here we verify the hook returns correct state
      const mockSubmitFn = vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );

      const { useFormSubmit } = await import('@/hooks/useFormSubmit');
      const { result } = await import('@testing-library/react').then(lib => 
        lib.renderHook(() => useFormSubmit(mockSubmitFn), { wrapper: Wrapper })
      );

      const submitPromise = result.current.handleSubmit();
      
      expect(result.current.isSubmitting).toBe(true);
      
      await submitPromise;
      
      expect(result.current.isSubmitting).toBe(false);
    });
  });
});


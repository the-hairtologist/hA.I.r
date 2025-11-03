import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@/lib/testing/testUtils';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { useFormSubmit } from '@/hooks/useFormSubmit';
import { toast } from 'sonner';
import type { Mock } from 'vitest';

vi.mock('sonner', () => {
  const toastMock = Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  });

  return { toast: toastMock };
});

vi.mock('@/lib/logger', () => ({
  log: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const createWrapper = (): React.FC<{ children: ReactNode }> => {
  const queryClient = createQueryClient();

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe('useFormSubmit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('double submit prevention', () => {
    it('prevents concurrent submissions', async () => {
      const mockSubmit = vi
        .fn()
        .mockImplementation(
          () => new Promise(resolve => setTimeout(resolve, 100))
        );

      const { result } = renderHook(() => useFormSubmit(mockSubmit), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.handleSubmit();
        result.current.handleSubmit();
      });

      await waitFor(() => expect(mockSubmit).toHaveBeenCalledTimes(1));
    });

    it('blocks submissions within 1 second', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));

      const mockSubmit = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useFormSubmit(mockSubmit), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockSubmit).toHaveBeenCalledTimes(1);

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockSubmit).toHaveBeenCalledTimes(1);
    });

    it('allows submission after 1 second', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));

      const mockSubmit = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useFormSubmit(mockSubmit), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1100);
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockSubmit).toHaveBeenCalledTimes(2);
    });
  });

  describe('network delay handling', () => {
    it('maintains submitting state during long requests', async () => {
      const mockSubmit = vi
        .fn()
        .mockImplementation(
          () => new Promise(resolve => setTimeout(resolve, 150))
        );

      const { result } = renderHook(() => useFormSubmit(mockSubmit), {
        wrapper: createWrapper(),
      });

      const submissionPromise = result.current.handleSubmit();

      await waitFor(() => expect(result.current.isSubmitting).toBe(true));

      // These should be ignored
      result.current.handleSubmit();
      result.current.handleSubmit();

      await act(async () => {
        await submissionPromise;
      });

      expect(mockSubmit).toHaveBeenCalledTimes(1);
      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('form state management', () => {
    it('resets state after successful submission', async () => {
      const mockSubmit = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useFormSubmit(mockSubmit), {
        wrapper: createWrapper(),
      });
      await act(async () => {
        await result.current.handleSubmit();
      });
      await waitFor(() => expect(result.current.isSubmitting).toBe(false));
      expect(result.current.errors).toEqual({});
    });

    it('exposes failure state', async () => {
      const mockSubmit = vi
        .fn()
        .mockRejectedValue(new Error('Submission failed'));
      const { result } = renderHook(() => useFormSubmit(mockSubmit, { enableRetry: false }), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      await waitFor(() => expect(result.current.isSubmitting).toBe(false));
      expect(result.current.submitCount).toBe(1);
      expect(toast.error).toHaveBeenCalledWith('Submission failed');
    });

    it('returns initial values after reset', async () => {
      type FormData = { name: string };

      const mockSubmit = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useFormSubmit<FormData>(mockSubmit, { initialValues: { name: '' } }), {
        wrapper: createWrapper(),
      });
      act(() => {
        result.current.setFieldValue('name', 'Updated');
        result.current.setFieldTouched('name', true);
      });

      expect(result.current.values.name).toBe('Updated');
      expect(result.current.touched.name).toBe(true);

      act(() => {
        result.current.reset();
      });

      expect(result.current.values.name).toBe('');
      expect(result.current.touched).toEqual({});
    });
  });

  describe('submit count tracking', () => {
    it('increments submit count for valid attempts', async () => {
      vi.useFakeTimers();
      const mockSubmit = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useFormSubmit(mockSubmit), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      await waitFor(() => expect(result.current.submitCount).toBe(1));

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1100);
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      await waitFor(() => expect(result.current.submitCount).toBe(2));
    });
  });

  describe('accessibility', () => {
    it('toggles aria-busy state via isSubmitting flag', async () => {
      const mockSubmit = vi
        .fn()
        .mockImplementation(
          () => new Promise(resolve => setTimeout(resolve, 100))
        );

      const { result } = renderHook(() => useFormSubmit(mockSubmit), {
        wrapper: createWrapper(),
      });

      let pendingSubmit: Promise<void> | undefined;
      act(() => {
        pendingSubmit = result.current.handleSubmit();
      });

      await waitFor(() => expect(result.current.isSubmitting).toBe(true));

      await act(async () => {
        await pendingSubmit;
      });

      await waitFor(() => expect(result.current.isSubmitting).toBe(false));
    });
  });
});

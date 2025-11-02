import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
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

const createWrapper = (): React.FC<{ children: ReactNode }> => {
  const queryClient = createQueryClient();
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
};

const TypedWrapper = createWrapper();
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
      const { result } = renderHook(() => useFormSubmit(mockSubmit), {
        wrapper: TypedWrapper,
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
        wrapper: TypedWrapper,
      const { result } = renderHook(() => useFormSubmit(mockSubmit), {
        wrapper: TypedWrapper,
      result.current.handleSubmit();
      result.current.handleSubmit();

      await waitFor(() => expect(mockSubmit).toHaveBeenCalledTimes(1));
    });

    it('blocks submissions within 1 second', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));

      const mockSubmit = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useFormSubmit(mockSubmit), {
        wrapper: TypedWrapper,
      });
      await result.current.handleSubmit();

      expect(mockSubmit).toHaveBeenCalledTimes(1);
    });

    it('allows submission after 1 second', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));

      const mockSubmit = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useFormSubmit(mockSubmit), {
        wrapper: TypedWrapper,
      });
      await result.current.handleSubmit();
      await vi.advanceTimersByTimeAsync(1100);
      await result.current.handleSubmit();

      expect(mockSubmit).toHaveBeenCalledTimes(2);
      const { result } = renderHook(() => useFormSubmit(mockSubmit), {
        wrapper: TypedWrapper,

  describe('network delay handling', () => {
    it('maintains submitting state during long requests', async () => {
      vi.useFakeTimers();

      let resolveSubmission: (() => void) | undefined;
      const submission = new Promise<void>(resolve => {
        resolveSubmission = resolve;
      });

      const mockSubmit = vi.fn().mockReturnValue(submission);
      const { result } = renderHook(() => useFormSubmit(mockSubmit), {
        wrapper: TypedWrapper,
      });
      let pendingSubmit: Promise<void> | undefined;
      await act(async () => {
        pendingSubmit = result.current.handleSubmit();
      });

      await waitFor(() => expect(result.current.isSubmitting).toBe(true));

      await act(async () => {
        result.current.handleSubmit();
        result.current.handleSubmit();
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(3000);
      });

      expect(mockSubmit).toHaveBeenCalledTimes(1);
      expect(result.current.isSubmitting).toBe(true);
      const { result } = renderHook(() => useFormSubmit(mockSubmit), {
        wrapper: TypedWrapper,
        resolveSubmission?.();
        await pendingSubmit;
      });

      await waitFor(() => expect(result.current.isSubmitting).toBe(false));
    });
  });

  describe('form state management', () => {
    it('resets state after successful submission', async () => {
      const mockSubmit = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useFormSubmit(mockSubmit), {
        wrapper: TypedWrapper,
      });
      await result.current.handleSubmit();
      await waitFor(() => expect(result.current.isSubmitting).toBe(false));
      expect(result.current.errors).toEqual({});
    });

    it('exposes failure state', async () => {
      const mockSubmit = vi
        .fn()
        .mockRejectedValue(new Error('Submission failed'));
      const { result } = renderHook(() => useFormSubmit(mockSubmit, { enableRetry: false }), {
        wrapper: TypedWrapper,
      });

      await waitFor(() => expect(result.current.isSubmitting).toBe(false));
      expect(result.current.submitCount).toBe(1);
      expect(toast.error).toHaveBeenCalledWith('Submission failed');
    });

    it('returns initial values after reset', async () => {
      type FormData = { name: string };

      const mockSubmit = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useFormSubmit<FormData>(mockSubmit, { initialValues: { name: '' } }), {
        wrapper: TypedWrapper,
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
      vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));

      const mockSubmit = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useFormSubmit(mockSubmit), {
        wrapper: TypedWrapper,
      });

      const { result } = renderHook(() => useFormSubmit(mockSubmit), {
        wrapper: TypedWrapper,
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

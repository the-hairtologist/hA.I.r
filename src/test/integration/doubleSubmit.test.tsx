import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { useFormSubmit } from "@/hooks/useFormSubmit";
import { toast } from "sonner";

vi.mock("sonner", () => {
  const toastMock = Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  });

  return { toast: toastMock };
});

vi.mock("@/lib/logger", () => ({
  log: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const createWrapper = () => {
  const queryClient = createQueryClient();

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe("useFormSubmit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("double submit prevention", () => {
    it("prevents concurrent submissions", async () => {
      const mockSubmit = vi
        .fn()
        .mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

      const { result } = renderHook(() => useFormSubmit(mockSubmit), {
        wrapper: createWrapper(),
      });

      result.current.handleSubmit();
      result.current.handleSubmit();
      result.current.handleSubmit();

      await waitFor(() => expect(mockSubmit).toHaveBeenCalledTimes(1));
    });

    it("blocks submissions within 1 second", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2024-01-01T00:00:00.000Z"));

      const mockSubmit = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useFormSubmit(mockSubmit), {
        wrapper: createWrapper(),
      });

      await result.current.handleSubmit();
      await result.current.handleSubmit();

      expect(mockSubmit).toHaveBeenCalledTimes(1);
    });

    it("allows submission after 1 second", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2024-01-01T00:00:00.000Z"));

      const mockSubmit = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useFormSubmit(mockSubmit), {
        wrapper: createWrapper(),
      });

      await result.current.handleSubmit();
      await vi.advanceTimersByTimeAsync(1100);
      await result.current.handleSubmit();

      expect(mockSubmit).toHaveBeenCalledTimes(2);
    });
  });

  describe("network delay handling", () => {
    it("maintains submitting state during long requests", async () => {
      vi.useFakeTimers();

      let resolveSubmission: (() => void) | undefined;
      const submission = new Promise<void>((resolve) => {
        resolveSubmission = resolve;
      });

      const mockSubmit = vi.fn().mockReturnValue(submission);
      const { result } = renderHook(() => useFormSubmit(mockSubmit), {
        wrapper: createWrapper(),
      });

      const pendingSubmit = result.current.handleSubmit();

      await waitFor(() => expect(result.current.isSubmitting).toBe(true));

      result.current.handleSubmit();
      result.current.handleSubmit();

      await vi.advanceTimersByTimeAsync(3000);

      expect(mockSubmit).toHaveBeenCalledTimes(1);
      expect(result.current.isSubmitting).toBe(true);

      resolveSubmission?.();
      await pendingSubmit;

      await waitFor(() => expect(result.current.isSubmitting).toBe(false));
    });
  });

  describe("form state management", () => {
    it("resets state after successful submission", async () => {
      const mockSubmit = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useFormSubmit(mockSubmit), {
        wrapper: createWrapper(),
      });

      await result.current.handleSubmit();

      await waitFor(() => expect(result.current.isSubmitting).toBe(false));
      expect(result.current.errors).toEqual({});
    });

    it("exposes failure state", async () => {
      const mockSubmit = vi.fn().mockRejectedValue(new Error("Submission failed"));
      const { result } = renderHook(() => useFormSubmit(mockSubmit, { enableRetry: false }), {
        wrapper: createWrapper(),
      });

      await expect(result.current.handleSubmit()).rejects.toThrow("Submission failed");

      await waitFor(() => expect(result.current.isSubmitting).toBe(false));
      expect(result.current.submitCount).toBe(1);
      expect((toast as any).error).toHaveBeenCalledWith("Submission failed");
    });

    it("returns initial values after reset", async () => {
      type FormData = { name: string };

      const mockSubmit = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(
        () => useFormSubmit<FormData>(mockSubmit, { initialValues: { name: "" } }),
        { wrapper: createWrapper() }
      );

      act(() => {
        result.current.setFieldValue("name", "Updated");
        result.current.setFieldTouched("name", true);
      });

      expect(result.current.values.name).toBe("Updated");
      expect(result.current.touched.name).toBe(true);

      act(() => {
        result.current.reset();
      });

      expect(result.current.values.name).toBe("");
      expect(result.current.touched).toEqual({});
    });
  });

  describe("submit count tracking", () => {
    it("increments submit count for valid attempts", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2024-01-01T00:00:00.000Z"));

      const mockSubmit = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useFormSubmit(mockSubmit), {
        wrapper: createWrapper(),
      });

      expect(result.current.submitCount).toBe(0);

      await result.current.handleSubmit();
      await waitFor(() => expect(result.current.submitCount).toBe(1));

      await vi.advanceTimersByTimeAsync(1100);

      await result.current.handleSubmit();
      await waitFor(() => expect(result.current.submitCount).toBe(2));
    });
  });

  describe("accessibility", () => {
    it("toggles aria-busy state via isSubmitting flag", async () => {
      const mockSubmit = vi
        .fn()
        .mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

      const { result } = renderHook(() => useFormSubmit(mockSubmit), {
        wrapper: createWrapper(),
      });

      const pendingSubmit = result.current.handleSubmit();

      await waitFor(() => expect(result.current.isSubmitting).toBe(true));

      await pendingSubmit;

      await waitFor(() => expect(result.current.isSubmitting).toBe(false));
    });
  });
});

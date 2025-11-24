/**
 * Tests for useAICall hook
 * Critical AI functionality testing
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { renderHook, waitFor, act } from '@/lib/testing/testUtils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAICall } from './useAICall';
import { supabase } from '@/integrations/supabase/client';

// Mock supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useAICall', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should handle successful AI call', async () => {
    const mockData = { success: true };
    (supabase.functions.invoke as Mock).mockResolvedValue({
      data: mockData,
      error: null,
    });

    const { result } = renderHook(() => useAICall('test-function'), {
      wrapper: createWrapper(),
    });

    let response;
    await act(async () => {
      response = await result.current.invoke({ prompt: 'test' });
    });

    expect(response).toEqual(mockData);

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBeNull();
    });

    expect(supabase.functions.invoke).toHaveBeenCalledWith('test-function', {
      body: { prompt: 'test' },
    });
  });

  it('should handle API errors gracefully', async () => {
    const mockError = { message: 'API Error', code: '500' };
    (supabase.functions.invoke as Mock).mockResolvedValue({
      data: null,
      error: mockError,
    });

    const { result } = renderHook(() => useAICall('test-function'), {
      wrapper: createWrapper(),
    });

    let response;
    await act(async () => {
      response = await result.current.invoke({ prompt: 'test' });
    });

    expect(response).toBeNull();

    await waitFor(() => {
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeDefined();
      expect(result.current.error?.message).toContain('API Error');
    });
  });

  it('should handle rate limit errors', async () => {
    const mockError = { message: 'Rate limit exceeded', code: '429' };
    (supabase.functions.invoke as Mock).mockResolvedValue({
      data: null,
      error: mockError,
    });

    const { result } = renderHook(() => useAICall('test-function'), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.invoke({ prompt: 'test' });
    });

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
      expect(result.current.error?.message).toContain(
        'High AI usage right now'
      );
    });
  });

  it('should retry failed requests', async () => {
    const mockData = { success: true };
    const failureError = { message: 'Temporary failure', code: '503' };

    (supabase.functions.invoke as Mock)
      .mockResolvedValueOnce({ data: null, error: failureError })
      .mockResolvedValueOnce({ data: mockData, error: null });

    const { result } = renderHook(
      () => useAICall('test-function', { maxRetries: 1, retryDelay: 10 }),
      {
        wrapper: createWrapper(),
      }
    );

    let response;
    await act(async () => {
      response = await result.current.invoke({ prompt: 'test' });
    });

    // The hook should return the successful response after retrying
    expect(response).toEqual(mockData);

    // The final successful data will be in result.current.data
    await waitFor(() => {
      expect(result.current.data).toEqual(mockData);
      expect(supabase.functions.invoke).toHaveBeenCalledTimes(2);
    });
  });

  it('should handle timeout errors', async () => {
    (supabase.functions.invoke as Mock).mockImplementation(() => {
      return new Promise(resolve =>
        setTimeout(() => resolve({ error: { message: 'Request timed out' } }), 100)
      );
    });

    const { result } = renderHook(
      () => useAICall('test-function', { timeout: 50 }),
      {
        wrapper: createWrapper(),
      }
    );

    let response;
    await act(async () => {
      response = await result.current.invoke({ prompt: 'test' });
    });

    expect(response).toBeNull();
    await waitFor(() => {
      expect(result.current.error).toBeDefined();
      expect(result.current.error?.message).toContain(
        'AI feature error: Request timed out'
      );
    });
  });

  it('should validate required parameters', async () => {
    const { result } = renderHook(() => useAICall(''), {
      wrapper: createWrapper(),
    });

    const response = await result.current.invoke({ prompt: 'test' });
    expect(response).toBeNull();
    expect(result.current.data).toBeNull();
    await expect(result.current.invoke({ prompt: 'test' })).rejects.toThrow(
      'AI feature error: functionName is required'
    );
  });

  it('should track loading state correctly', async () => {
    (supabase.functions.invoke as Mock).mockImplementation(
      () =>
        new Promise(resolve =>
          setTimeout(
            () => resolve({ data: { done: true }, error: null }),
            50
          )
        )
    );

    const { result } = renderHook(() => useAICall('test-function'), {
      wrapper: createWrapper(),
    });

    let invokePromise: Promise<unknown>;
    act(() => {
      invokePromise = result.current.invoke({ prompt: 'test' });
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await invokePromise;
    });

    expect(result.current.loading).toBe(false);
  });

  it('should support different AI models', async () => {
    const models = [
      'google/gemini-2.5-pro',
      'google/gemini-2.5-flash',
      'openai/gpt-4o',
    ];

    for (const model of models) {
      const { result } = renderHook(() => useAICall('test-function', { model }), {
        wrapper: createWrapper(),
      });

      (supabase.functions.invoke as Mock).mockResolvedValue({
        data: { modelUsed: model },
        error: null,
      });

      let response;
      await act(async () => {
        response = await result.current.invoke({ prompt: 'test' });
      });

      expect(response).toEqual({ modelUsed: model });
      expect(supabase.functions.invoke).toHaveBeenCalledWith('test-function', {
        body: { prompt: 'test' },
      });
    }
  });
});
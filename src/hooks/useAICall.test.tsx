/**
 * Tests for useAICall hook
 * Critical AI functionality testing
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAICall } from './useAICall';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Create wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
  
  return Wrapper;
};

describe('useAICall', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should handle successful AI call', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{
          message: { content: 'Test response' }
        }]
      }),
    });

    const { result } = renderHook(() => useAICall(), {
      wrapper: createWrapper(),
    });

    const response = await result.current.callAI({
      model: 'google/gemini-2.5-flash',
      messages: [{ role: 'user', content: 'Test' }],
    });

    expect(response).toBeDefined();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should handle API errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useAICall(), {
      wrapper: createWrapper(),
    });

    await expect(
      result.current.callAI({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: 'Test' }],
      })
    ).rejects.toThrow('Network error');
  });

  it('should handle rate limit errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({ error: 'Rate limit exceeded' }),
    });

    const { result } = renderHook(() => useAICall(), {
      wrapper: createWrapper(),
    });

    await expect(
      result.current.callAI({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: 'Test' }],
      })
    ).rejects.toThrow();
  });

  it('should retry failed requests', async () => {
    let attempts = 0;
    mockFetch.mockImplementation(() => {
      attempts++;
      if (attempts < 2) {
        return Promise.reject(new Error('Temporary failure'));
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          choices: [{
            message: { content: 'Success after retry' }
          }]
        }),
      });
    });

    const { result } = renderHook(() => useAICall(), {
      wrapper: createWrapper(),
    });

    const response = await result.current.callAI({
      model: 'google/gemini-2.5-flash',
      messages: [{ role: 'user', content: 'Test' }],
    });

    expect(attempts).toBeGreaterThan(1);
    expect(response).toBeDefined();
  });

  it('should handle timeout errors', async () => {
    mockFetch.mockImplementation(
      () => new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 100)
      )
    );

    const { result } = renderHook(() => useAICall(), {
      wrapper: createWrapper(),
    });

    await expect(
      result.current.callAI({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: 'Test' }],
      })
    ).rejects.toThrow('Timeout');
  });

  it('should validate required parameters', async () => {
    const { result } = renderHook(() => useAICall(), {
      wrapper: createWrapper(),
    });

    await expect(
      result.current.callAI({
        model: '',
        messages: [],
      })
    ).rejects.toThrow();
  });

  it('should track loading state correctly', async () => {
    mockFetch.mockImplementation(
      () => new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: async () => ({
            choices: [{ message: { content: 'Done' } }]
          }),
        }), 50)
      )
    );

    const { result } = renderHook(() => useAICall(), {
      wrapper: createWrapper(),
    });

    const callPromise = result.current.callAI({
      model: 'google/gemini-2.5-flash',
      messages: [{ role: 'user', content: 'Test' }],
    });

    // Should be loading initially
    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });

    await callPromise;

    // Should not be loading after completion
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should support different AI models', async () => {
    const models = [
      'google/gemini-2.5-pro',
      'google/gemini-2.5-flash',
      'google/gemini-2.5-flash-lite',
    ];

    for (const model of models) {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: `Response from ${model}` } }]
        }),
      });

      const { result } = renderHook(() => useAICall(), {
        wrapper: createWrapper(),
      });

      const response = await result.current.callAI({
        model,
        messages: [{ role: 'user', content: 'Test' }],
      });

      expect(response).toBeDefined();
    }
  });
});

/**
 * Tests for useMessageGenerator hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMessageGenerator } from './useMessageGenerator';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useMessageGenerator', () => {
  const mockContext = {
    messageType: 'retention' as const,
    clientName: 'John Doe',
    stylistName: 'Jane Smith',
    lastVisit: '2025-09-15',
    favoriteServices: ['Color', 'Cut'],
    customNote: 'Client prefers morning appointments',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useMessageGenerator());

    expect(result.current.generating).toBe(false);
    expect(result.current.message).toBeNull();
  });

  it.skip('should generate message successfully', async () => {
    const mockMessage = {
      subject: 'We miss you!',
      body: 'Hi John, we miss seeing you!',
      call_to_action: 'Book your next appointment',
      tone: 'warm' as const,
    };

    const { supabase } = await import('@/integrations/supabase/client');
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: mockMessage,
      error: null,
    });

    const { result } = renderHook(() => useMessageGenerator());

    const messagePromise = result.current.generateMessage(mockContext);

    expect(result.current.generating).toBe(true);

    const returnedMessage = await messagePromise;

    expect(result.current.generating).toBe(false);
    expect(result.current.message).toEqual(mockMessage);
    expect(returnedMessage).toEqual(mockMessage);
  });

  it('should handle generation errors', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: null,
      error: new Error('Generation failed'),
    });

    const { result } = renderHook(() => useMessageGenerator());

    const messageResult = await result.current.generateMessage(mockContext);

    expect(result.current.generating).toBe(false);
    expect(messageResult).toBeNull();
  });

  it('should generate bulk messages', async () => {
    const mockMessage = {
      subject: 'Test',
      body: 'Test body',
      call_to_action: 'Test CTA',
      tone: 'professional' as const,
    };

    const { supabase } = await import('@/integrations/supabase/client');
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: mockMessage,
      error: null,
    });

    const { result } = renderHook(() => useMessageGenerator());

    const contexts = [mockContext, { ...mockContext, clientName: 'Jane Doe' }];
    const messages = await result.current.generateBulkMessages(contexts);

    expect(result.current.generating).toBe(false);
    expect(messages).toHaveLength(2);
  });
});

/**
 * Tests for useSchedulePredictor hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSchedulePredictor } from './useSchedulePredictor';

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

describe('useSchedulePredictor', () => {
  const mockContext = {
    clientId: 'client-123',
    lastAppointmentDate: '2025-09-15',
    preferredDays: ['Monday', 'Wednesday'],
    preferredTimeOfDay: 'morning',
    serviceHistory: ['Color', 'Cut'],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useSchedulePredictor());

    expect(result.current.predicting).toBe(false);
    expect(result.current.prediction).toBeNull();
  });

  it.skip('should handle successful prediction', async () => {
    const mockPrediction = {
      suggested_date: '2025-10-20',
      suggested_time: '10:00 AM',
      confidence: 0.85,
      reasoning: 'Based on client history',
      alternative_dates: [
        { date: '2025-10-22', time: '11:00 AM', confidence: 0.75 },
      ],
    };

    const { supabase } = await import('@/integrations/supabase/client');
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: mockPrediction,
      error: null,
    });

    const { result } = renderHook(() => useSchedulePredictor());

    const predictionPromise =
      result.current.predictNextAppointment(mockContext);

    expect(result.current.predicting).toBe(true);

    const returnedPrediction = await predictionPromise;

    expect(result.current.predicting).toBe(false);
    expect(result.current.prediction).toEqual(mockPrediction);
    expect(returnedPrediction).toEqual(mockPrediction);
  });

  it('should handle prediction errors', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: null,
      error: new Error('Prediction failed'),
    });

    const { result } = renderHook(() => useSchedulePredictor());

    const predictionResult =
      await result.current.predictNextAppointment(mockContext);

    expect(result.current.predicting).toBe(false);
    expect(predictionResult).toBeNull();
  });
});

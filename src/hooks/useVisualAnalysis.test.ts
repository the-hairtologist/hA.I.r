/**
 * Tests for useVisualAnalysis hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useVisualAnalysis } from './useVisualAnalysis';

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

describe('useVisualAnalysis', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useVisualAnalysis());

    expect(result.current.analyzing).toBe(false);
    expect(result.current.analysis).toBeNull();
  });

  it.skip('should handle successful photo analysis', async () => {
    const mockAnalysis = {
      condition_score: 85,
      damage_level: 'minimal' as const,
      color_fade_percentage: 15,
      texture: 'medium' as const,
      porosity: 'normal' as const,
      recommendations: [
        {
          category: 'Hydration',
          recommendation: 'Use deep conditioning mask',
          priority: 'medium',
        },
      ],
    };

    const { supabase } = await import('@/integrations/supabase/client');
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: mockAnalysis,
      error: null,
    });

    const { result } = renderHook(() => useVisualAnalysis());

    let analysisPromise: any;
    act(() => {
      analysisPromise = result.current.analyzeHairPhoto(
        'https://example.com/photo.jpg',
        'client-123',
        'Before color treatment'
      );
    });

    await waitFor(() => {
      expect(result.current.analyzing).toBe(true);
    });

    const returnedAnalysis = await analysisPromise;

    expect(result.current.analyzing).toBe(false);
    expect(result.current.analysis).toEqual(mockAnalysis);
    expect(returnedAnalysis).toEqual(mockAnalysis);
  });

  it('should not analyze without photoUrl', async () => {
    const { result } = renderHook(() => useVisualAnalysis());

    const analysisResult = await result.current.analyzeHairPhoto(
      '',
      'client-123'
    );

    expect(analysisResult).toBeNull();
  });

  it('should not analyze without clientId', async () => {
    const { result } = renderHook(() => useVisualAnalysis());

    const analysisResult = await result.current.analyzeHairPhoto(
      'https://example.com/photo.jpg',
      ''
    );

    expect(analysisResult).toBeNull();
  });

  it('should handle analysis errors', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: null,
      error: new Error('Analysis failed'),
    });

    const { result } = renderHook(() => useVisualAnalysis());

    const analysisResult = await result.current.analyzeHairPhoto(
      'https://example.com/photo.jpg',
      'client-123'
    );

    expect(result.current.analyzing).toBe(false);
    expect(analysisResult).toBeNull();
  });
});

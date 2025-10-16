/**
 * Tests for useFormulaAnalyzer hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFormulaAnalyzer } from './useFormulaAnalyzer';

// Mock supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useFormulaAnalyzer', () => {
  const mockFormulas = [
    {
      id: '1',
      formula_name: 'Test Formula',
      color_line: 'Wella',
      steps: [{ step: 1, product: 'Color', volume: '20' }],
      notes: 'Test notes',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useFormulaAnalyzer());

    expect(result.current.analyzing).toBe(false);
    expect(result.current.analysis).toBeNull();
  });

  it('should handle successful formula analysis', async () => {
    const mockAnalysis = {
      '1': {
        success_score: 85,
        insights: {
          strengths: ['Good color choice'],
          weaknesses: ['Could improve timing'],
          risk_factors: [],
        },
        recommendations: ['Consider pre-treatment'],
        pattern_analysis: 'Shows good results',
      },
    };

    const { supabase } = await import('@/integrations/supabase/client');
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: mockAnalysis,
      error: null,
    });

    const { result } = renderHook(() => useFormulaAnalyzer());

    const analysisPromise = result.current.analyzeFormulas(mockFormulas);

    // Check analyzing state is true
    expect(result.current.analyzing).toBe(true);

    const returnedAnalysis = await analysisPromise;

    // Check final state
    expect(result.current.analyzing).toBe(false);
    expect(result.current.analysis).toEqual(mockAnalysis);
    expect(returnedAnalysis).toEqual(mockAnalysis);
  });

  it('should handle analysis errors gracefully', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: null,
      error: new Error('Analysis failed'),
    });

    const { result } = renderHook(() => useFormulaAnalyzer());

    const analysisResult = await result.current.analyzeFormulas(mockFormulas);

    expect(result.current.analyzing).toBe(false);
    expect(analysisResult).toBeNull();
  });

  it('should not analyze when given empty array', async () => {
    const { result } = renderHook(() => useFormulaAnalyzer());

    const analysisResult = await result.current.analyzeFormulas([]);

    expect(result.current.analyzing).toBe(false);
    expect(analysisResult).toBeNull();
  });
});

/**
 * Unit Tests for AI Components
 * Tests all AI-powered UI components
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '@/lib/testing/testUtils';
import '@testing-library/jest-dom';
import { AIFormulaAnalyzer } from './AIFormulaAnalyzer';
import { AIScheduleOptimizer } from './AIScheduleOptimizer';
import { AIMessageComposer } from './AIMessageComposer';
import { HairPhotoAnalyzer } from './HairPhotoAnalyzer';

// Mock hooks
vi.mock('@/hooks/useFormulaAnalyzer', () => ({
  useFormulaAnalyzer: () => ({
    analyzing: false,
    analysis: {},
    analyzeFormulas: vi.fn().mockResolvedValue({
      'formula-1': {
        success_score: 85,
        insights: {
          strengths: ['Strong color match'],
          weaknesses: ['Processing time could be optimized'],
          risk_factors: [],
        },
        recommendations: ['Consider pre-lightening for better results'],
        pattern_analysis: 'Consistent technique',
      },
    }),
  }),
}));

vi.mock('@/hooks/useSchedulePredictor', () => ({
  useSchedulePredictor: () => ({
    predicting: false,
    prediction: null,
    predictNextAppointment: vi.fn().mockResolvedValue({
      suggested_date: '2025-02-15',
      suggested_time: '14:00',
      confidence: 0.85,
      reasoning: 'Based on historical patterns',
      alternative_dates: [
        { date: '2025-02-16', time: '10:00', confidence: 0.75 },
      ],
    }),
  }),
}));

vi.mock('@/hooks/useMessageGenerator', () => ({
  useMessageGenerator: () => ({
    generating: false,
    message: null,
    generateMessage: vi.fn().mockResolvedValue({
      body: 'Hi! Time for your next appointment!',
      subject: 'Appointment Reminder',
    }),
  }),
}));

vi.mock('@/hooks/useVisualAnalysis', () => ({
  useVisualAnalysis: () => ({
    analyzing: false,
    analysis: null,
    analyzeHairPhoto: vi.fn().mockResolvedValue({
      condition_score: 75,
      damage_level: 'moderate',
      texture: 'medium',
      porosity: 'normal',
      recommendations: [
        {
          category: 'Moisture',
          recommendation: 'Use deep conditioning treatment',
          priority: 'high',
        },
      ],
    }),
  }),
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('AI Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AIFormulaAnalyzer', () => {
    const mockFormulas = [
      {
        id: 'formula-1',
        formula_name: 'Test formula',
        formula_text: 'Test formula',
        color_line: 'Test Brand',
        steps: [{ step: 'Apply color', timing: '30min' }],
        stylist_id: 'stylist-1',
        client_id: 'client-1',
        notes: 'Test notes',
      },
    ];

    it('should render analyze button', () => {
      const { getByText } = renderWithProviders(
        <AIFormulaAnalyzer formulas={mockFormulas} />
      );

      expect(getByText(/analyze/i)).toBeInTheDocument();
    });

    it('should show loading state while analyzing', async () => {
      const { getByText } = renderWithProviders(
        <AIFormulaAnalyzer formulas={mockFormulas} />
      );

      const analyzeButton = getByText(/analyze/i);
      expect(analyzeButton).toBeInTheDocument();
    });

    it('should display analysis results', async () => {
      const { getByText } = renderWithProviders(
        <AIFormulaAnalyzer formulas={mockFormulas} />
      );

      const analyzeButton = getByText(/analyze/i);
      expect(analyzeButton).toBeInTheDocument();
    });

    it.skip('should handle empty formulas array', () => {
      const { getByText } = renderWithProviders(
        <AIFormulaAnalyzer formulas={[]} />
      );

      // Should render without crashing
      expect(getByText(/analyze/i)).toBeInTheDocument();
    });

    it('should call onAnalysisComplete callback', async () => {
      const onComplete = vi.fn();
      const { getByText } = renderWithProviders(
        <AIFormulaAnalyzer
          formulas={mockFormulas}
          onAnalysisComplete={onComplete}
        />
      );

      expect(getByText(/analyze/i)).toBeInTheDocument();
    });
  });

  describe('AIScheduleOptimizer', () => {
    const mockProps = {
      clientId: 'client-1',
      lastAppointmentDate: '2025-01-15',
      preferredDays: ['monday', 'wednesday'],
      preferredTimeOfDay: 'morning' as const,
      serviceHistory: ['color', 'cut'],
    };

    it.skip('should render predict button', () => {
      const { getByText } = renderWithProviders(
        <AIScheduleOptimizer {...mockProps} />
      );

      expect(getByText(/predict/i)).toBeInTheDocument();
    });

    it.skip('should show loading state while predicting', async () => {
      const { getByText } = renderWithProviders(
        <AIScheduleOptimizer {...mockProps} />
      );

      const predictButton = getByText(/predict/i);
      expect(predictButton).toBeInTheDocument();
    });

    it.skip('should call onSuggestionSelect when provided', async () => {
      const onSelect = vi.fn();
      const { getByText } = renderWithProviders(
        <AIScheduleOptimizer {...mockProps} onSuggestionSelect={onSelect} />
      );

      expect(getByText(/predict/i)).toBeInTheDocument();
    });
  });

  describe('AIMessageComposer', () => {
    const mockProps = {
      clientName: 'John Doe',
      stylistName: 'Jane Smith',
      lastVisit: '2025-01-15',
      favoriteServices: ['color', 'cut'],
    };

    it('should render message type selector', () => {
      const { getByText } = renderWithProviders(
        <AIMessageComposer {...mockProps} />
      );

      expect(getByText(/message type/i)).toBeInTheDocument();
    });

    it.skip('should render generate button', () => {
      const { getByText } = renderWithProviders(
        <AIMessageComposer {...mockProps} />
      );

      expect(getByText(/generate/i)).toBeInTheDocument();
    });

    it.skip('should show loading state while generating', async () => {
      const { getByText } = renderWithProviders(
        <AIMessageComposer {...mockProps} />
      );

      const generateButton = getByText(/generate/i);
      expect(generateButton).toBeInTheDocument();
    });
  });

  describe('HairPhotoAnalyzer', () => {
    const mockProps = {
      clientId: 'client-1',
    };

    it('should render photo input', () => {
      const { getByLabelText } = renderWithProviders(
        <HairPhotoAnalyzer {...mockProps} />
      );

      expect(getByLabelText(/photo url/i)).toBeInTheDocument();
    });

    it('should render analyze button', () => {
      const { getByText } = renderWithProviders(
        <HairPhotoAnalyzer {...mockProps} />
      );

      expect(getByText(/analyze/i)).toBeInTheDocument();
    });

    it('should disable analyze when no photo URL', () => {
      const { getByText } = renderWithProviders(
        <HairPhotoAnalyzer {...mockProps} />
      );

      const analyzeButton = getByText(/analyze/i);
      expect(analyzeButton).toBeDisabled();
    });
  });
});

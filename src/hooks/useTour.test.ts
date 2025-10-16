/**
 * Unit tests for useTour hook
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTour } from './useTour';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('useTour', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should initialize with tour not running and not completed', () => {
    const { result } = renderHook(() => useTour('dashboard'));

    expect(result.current.isTourRunning).toBe(false);
    expect(result.current.isTourCompleted).toBe(false);
    expect(result.current.currentStep).toBe(0);
  });

  it('should start tour correctly', () => {
    const { result } = renderHook(() => useTour('dashboard'));

    act(() => {
      result.current.startTour();
    });

    expect(result.current.isTourRunning).toBe(true);
    expect(result.current.currentStep).toBe(0);
  });

  it('should complete tour and save to localStorage', () => {
    const { result } = renderHook(() => useTour('dashboard'));

    act(() => {
      result.current.startTour();
    });

    act(() => {
      result.current.completeTour();
    });

    expect(result.current.isTourRunning).toBe(false);
    expect(result.current.isTourCompleted).toBe(true);
    expect(localStorageMock.getItem('tour_completed_dashboard')).toBe('true');
  });

  it('should skip tour and mark as completed', () => {
    const { result } = renderHook(() => useTour('clients'));

    act(() => {
      result.current.startTour();
    });

    act(() => {
      result.current.skipTour();
    });

    expect(result.current.isTourRunning).toBe(false);
    expect(result.current.isTourCompleted).toBe(true);
    expect(localStorageMock.getItem('tour_completed_clients')).toBe('true');
  });

  it('should reset tour completion status', () => {
    const { result } = renderHook(() => useTour('dashboard'));

    act(() => {
      result.current.completeTour();
    });

    expect(result.current.isTourCompleted).toBe(true);

    act(() => {
      result.current.resetTour();
    });

    expect(result.current.isTourCompleted).toBe(false);
    expect(localStorageMock.getItem('tour_completed_dashboard')).toBeNull();
  });

  it('should load completed status from localStorage on init', () => {
    localStorageMock.setItem('tour_completed_ai-assistant', 'true');

    const { result } = renderHook(() => useTour('ai-assistant'));

    expect(result.current.isTourCompleted).toBe(true);
  });

  it('should handle invalid tourId gracefully', () => {
    const { result } = renderHook(() => useTour('invalid-tour' as any));

    expect(result.current.isTourRunning).toBe(false);
    expect(result.current.isTourCompleted).toBe(false);
  });

  it('should stop tour without marking as completed', () => {
    const { result } = renderHook(() => useTour('formulas'));

    act(() => {
      result.current.startTour();
    });

    expect(result.current.isTourRunning).toBe(true);

    act(() => {
      result.current.stopTour();
    });

    expect(result.current.isTourRunning).toBe(false);
    expect(result.current.isTourCompleted).toBe(false);
  });
});

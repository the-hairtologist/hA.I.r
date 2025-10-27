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

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: '/dashboard' })
}));

// Mock tours config
vi.mock('@/config/tours', () => ({
  getTourByPath: vi.fn((path: string) => {
    if (path === '/dashboard') return { id: 'dashboard' };
    if (path === '/clients') return { id: 'clients' };
    return null;
  })
}));

describe('useTour', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should initialize with tour not running', () => {
    const { result } = renderHook(() => useTour());

    expect(result.current.isRunning).toBe(false);
    expect(result.current.currentTour).toBeNull();
  });

  it('should start tour with specific ID', () => {
    const { result } = renderHook(() => useTour());

    act(() => {
      result.current.startTour('dashboard');
    });

    expect(result.current.isRunning).toBe(true);
    expect(result.current.currentTour).toBe('dashboard');
  });

  it('should end tour and mark as completed', () => {
    const { result } = renderHook(() => useTour());

    act(() => {
      result.current.startTour('dashboard');
    });

    act(() => {
      result.current.endTour();
    });

    expect(result.current.isRunning).toBe(false);
    expect(result.current.isTourCompleted('dashboard')).toBe(true);
  });

  it('should skip tour and mark as dismissed', () => {
    const { result } = renderHook(() => useTour());

    act(() => {
      result.current.startTour('clients');
    });

    act(() => {
      result.current.skipTour();
    });

    expect(result.current.isRunning).toBe(false);
    expect(result.current.shouldShowTour('clients')).toBe(false);
  });

  it('should check if tour should be shown', () => {
    const { result } = renderHook(() => useTour());

    expect(result.current.shouldShowTour('dashboard')).toBe(true);

    act(() => {
      result.current.startTour('dashboard');
    });

    act(() => {
      result.current.endTour();
    });

    expect(result.current.shouldShowTour('dashboard')).toBe(false);
  });

  it.skip('should reset all tours', () => {
    const { result } = renderHook(() => useTour());

    act(() => {
      result.current.startTour('dashboard');
      result.current.endTour();
    });

    expect(result.current.isTourCompleted('dashboard')).toBe(true);

    act(() => {
      result.current.resetAllTours();
    });

    expect(result.current.shouldShowTour('dashboard')).toBe(true);
  });

  it.skip('should persist completed tours in localStorage', () => {
    const { result } = renderHook(() => useTour());

    act(() => {
      result.current.startTour('dashboard');
      result.current.endTour();
    });

    const stored = localStorageMock.getItem('hair-completed-tours');
    expect(stored).toBeTruthy();
    expect(JSON.parse(stored!)).toContain('dashboard');
  });

  it.skip('should persist dismissed tours in localStorage', () => {
    const { result } = renderHook(() => useTour());

    act(() => {
      result.current.startTour('clients');
      result.current.skipTour();
    });

    const stored = localStorageMock.getItem('hair-dismissed-tours');
    expect(stored).toBeTruthy();
    expect(JSON.parse(stored!)).toContain('clients');
  });
});

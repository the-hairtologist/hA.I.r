import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@/lib/testing/testUtils';
import { useMobileDetection, useBreakpoint } from './useMobileDetection';

describe('useMobileDetection', () => {
  beforeEach(() => {
    // Mock window properties
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('should detect desktop by default', () => {
    const { result } = renderHook(() => useMobileDetection());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.screenWidth).toBe(1024);
    expect(result.current.screenHeight).toBe(768);
  });

  it.skip('should detect mobile viewport', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    const { result } = renderHook(() => useMobileDetection());

    expect(result.current.isMobile).toBe(true);
    expect(result.current.screenWidth).toBe(375);
  });

  it.skip('should detect tablet viewport', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });

    const { result } = renderHook(() => useMobileDetection());

    expect(result.current.isTablet).toBe(true);
  });

  it('should detect portrait orientation', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 812,
    });

    const { result } = renderHook(() => useMobileDetection());

    expect(result.current.orientation).toBe('portrait');
  });

  it('should detect landscape orientation', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 812,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 375,
    });

    const { result } = renderHook(() => useMobileDetection());

    expect(result.current.orientation).toBe('landscape');
  });
});

describe('useBreakpoint', () => {
  it('should detect when below breakpoint', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 600,
    });

    const { result } = renderHook(() => useBreakpoint(768));

    expect(result.current).toBe(true);
  });

  it('should detect when above breakpoint', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    const { result } = renderHook(() => useBreakpoint(768));

    expect(result.current).toBe(false);
  });
});

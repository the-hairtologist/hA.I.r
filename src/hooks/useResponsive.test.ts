import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@/lib/testing/testUtils';
import { useResponsive, useBreakpoint, useOrientation } from './useResponsive';

describe('useResponsive', () => {
  beforeEach(() => {
    // Mock window properties
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1080,
    });
    Object.defineProperty(window, 'devicePixelRatio', {
      writable: true,
      configurable: true,
      value: 2,
    });
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation(query => ({
        matches:
          query.includes('hover') ||
          query.includes('min-width') ||
          query.includes('1536'),
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

  it('should detect desktop state', () => {
    const { result } = renderHook(() => useResponsive());

    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.width).toBe(1920);
    expect(result.current.height).toBe(1080);
  });

  it('should detect mobile state', () => {
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

    const { result } = renderHook(() => useResponsive());

    expect(result.current.isMobile).toBe(true);
    expect(result.current.isDesktop).toBe(false);
  });

  it('should detect tablet state', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });

    const { result } = renderHook(() => useResponsive());

    expect(result.current.isTablet).toBe(true);
  });

  it('should detect breakpoints correctly', () => {
    const { result } = renderHook(() => useResponsive());

    expect(result.current.is2Xl).toBe(true); // >= 1536px
    expect(result.current.width).toBeGreaterThan(1024);
    expect(result.current.isDesktop).toBe(true);
  });

  it('should detect retina display', () => {
    const { result } = renderHook(() => useResponsive());

    expect(result.current.isRetina).toBe(true);
    expect(result.current.pixelRatio).toBe(2);
  });

  it('should detect hover capability', () => {
    const { result } = renderHook(() => useResponsive());

    expect(result.current.hasHover).toBe(true);
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

    const { result } = renderHook(() => useResponsive());

    expect(result.current.isPortrait).toBe(true);
    expect(result.current.isLandscape).toBe(false);
  });
});

describe('useBreakpoint', () => {
  it('should detect sm breakpoint', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 640,
    });

    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query.includes('640px'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useBreakpoint('sm'));

    expect(result.current).toBe(true);
  });

  it('should detect md breakpoint', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });

    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query.includes('768px'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useBreakpoint('md'));

    expect(result.current).toBe(true);
  });
});

describe('useOrientation', () => {
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

    const { result } = renderHook(() => useOrientation());

    expect(result.current).toBe('portrait');
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

    const { result } = renderHook(() => useOrientation());

    expect(result.current).toBe('landscape');
  });
});

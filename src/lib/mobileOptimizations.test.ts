import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Platform } from '@/platform';

// Mock Platform
vi.mock('@/platform', () => ({
  Platform: {
    isMobile: true,
    isIOS: true,
  }
}));

describe('Mobile Optimizations', () => {
  beforeEach(() => {
    // Reset DOM
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    document.body.style.overscrollBehavior = '';
  });

  it('prevents elastic scroll on iOS', async () => {
    const { preventElasticScroll } = await import('./mobileOptimizations');
    preventElasticScroll();
    
    expect(document.body.style.overscrollBehavior).toBe('none');
  });

  it('ensures zoom is enabled when viewport exists', async () => {
    // Create viewport tag
    const viewport = document.createElement('meta');
    viewport.setAttribute('name', 'viewport');
    document.head.appendChild(viewport);
    
    const { ensureZoomEnabled } = await import('./mobileOptimizations');
    ensureZoomEnabled();
    
    const content = viewport.getAttribute('content');
    expect(content).toContain('user-scalable=yes');
    expect(content).toContain('maximum-scale=5.0');
  });

  it('enables smooth scrolling on mobile', async () => {
    const { enableSmoothScrolling } = await import('./mobileOptimizations');
    enableSmoothScrolling();
    
    const style = document.documentElement.style as any;
    expect(style.webkitOverflowScrolling).toBe('touch');
  });

  it('initializes mobile optimizations', async () => {
    const { initMobileOptimizations } = await import('./mobileOptimizations');
    
    // Should not throw
    expect(() => initMobileOptimizations()).not.toThrow();
  });
});
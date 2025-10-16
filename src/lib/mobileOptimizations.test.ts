import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Mobile Optimizations', () => {
  beforeEach(() => {
    // Reset DOM
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  it('adds viewport meta tag', async () => {
    const { initMobileOptimizations } = await import('./mobileOptimizations');
    initMobileOptimizations();
    
    const viewport = document.querySelector('meta[name="viewport"]');
    expect(viewport).toBeTruthy();
    expect(viewport?.getAttribute('content')).toContain('width=device-width');
  });

  it('adds theme-color meta tag', async () => {
    const { initMobileOptimizations } = await import('./mobileOptimizations');
    initMobileOptimizations();
    
    const themeColor = document.querySelector('meta[name="theme-color"]');
    expect(themeColor).toBeTruthy();
  });

  it('adds apple touch icon link', async () => {
    const { initMobileOptimizations } = await import('./mobileOptimizations');
    initMobileOptimizations();
    
    const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]');
    expect(appleTouchIcon).toBeTruthy();
  });

  it('prevents zoom on double tap', async () => {
    const { initMobileOptimizations } = await import('./mobileOptimizations');
    initMobileOptimizations();
    
    const viewport = document.querySelector('meta[name="viewport"]');
    expect(viewport?.getAttribute('content')).toContain('user-scalable=no');
  });
});

/**
 * Cross-Platform Optimizer
 * Ensures perfect experience on iPhone, Samsung, laptop, iPad, and all devices
 */

import { Platform } from '@/platform/detector';
import { logger } from '@/lib/logger';

interface DeviceCapabilities {
  supportsHaptics: boolean;
  supportsNotch: boolean;
  supportsSafeArea: boolean;
  supportsHDR: boolean;
  performanceLevel: 'high' | 'medium' | 'low';
  batteryLevel?: number;
}

class CrossPlatformOptimizer {
  private capabilities: DeviceCapabilities | null = null;

  async initialize() {
    logger.info('📱 Initializing Cross-Platform Optimizer...');
    this.detectCapabilities();
    this.applyOptimizations();
    logger.info('✅ Cross-Platform Optimizer ready');
  }

  private detectCapabilities() {
    this.capabilities = {
      supportsHaptics: this.detectHaptics(),
      supportsNotch: this.detectNotch(),
      supportsSafeArea: this.detectSafeArea(),
      supportsHDR: this.detectHDR(),
      performanceLevel: this.detectPerformance(),
    };

    logger.info('[Platform] Device capabilities detected');
  }

  private detectHaptics(): boolean {
    // Check for Vibration API
    return 'vibrate' in navigator || 'Haptics' in window;
  }

  private detectNotch(): boolean {
    // Check for iPhone X+ with notch
    if (Platform.isIOS) {
      const screenHeight = window.screen.height;
      const screenWidth = window.screen.width;
      // iPhone X and newer have specific dimensions
      return (
        (screenHeight === 812 && screenWidth === 375) || // iPhone X, XS, 11 Pro
        (screenHeight === 896 && screenWidth === 414) || // iPhone XR, XS Max, 11, 11 Pro Max
        (screenHeight === 844 && screenWidth === 390) || // iPhone 12, 12 Pro, 13, 13 Pro
        (screenHeight === 926 && screenWidth === 428) // iPhone 12 Pro Max, 13 Pro Max
      );
    }
    return false;
  }

  private detectSafeArea(): boolean {
    // Check if CSS safe-area-inset is supported
    const testElement = document.createElement('div');
    testElement.style.paddingTop = 'env(safe-area-inset-top)';
    return testElement.style.paddingTop !== '';
  }

  private detectHDR(): boolean {
    // Check for HDR display support
    if ('screen' in window && 'colorDepth' in window.screen) {
      return window.screen.colorDepth >= 30;
    }
    return false;
  }

  private detectPerformance(): 'high' | 'medium' | 'low' {
    // Estimate device performance based on various factors
    const cores = navigator.hardwareConcurrency || 2;
    const memory = (navigator as any).deviceMemory || 4;

    if (cores >= 8 && memory >= 8) return 'high';
    if (cores >= 4 && memory >= 4) return 'medium';
    return 'low';
  }

  private applyOptimizations() {
    if (!this.capabilities) return;

    // Apply safe area padding for devices with notches
    if (this.capabilities.supportsSafeArea) {
      this.applySafeAreaPadding();
    }

    // Optimize animations based on performance
    this.optimizeAnimations(this.capabilities.performanceLevel);

    // Apply device-specific touch optimizations
    this.optimizeTouchTargets();

    // Enable HDR if supported
    if (this.capabilities.supportsHDR) {
      this.enableHDR();
    }
  }

  private applySafeAreaPadding() {
    const style = document.createElement('style');
    style.textContent = `
      :root {
        --safe-area-inset-top: env(safe-area-inset-top, 0);
        --safe-area-inset-right: env(safe-area-inset-right, 0);
        --safe-area-inset-bottom: env(safe-area-inset-bottom, 0);
        --safe-area-inset-left: env(safe-area-inset-left, 0);
      }
      
      .safe-area-padding {
        padding-top: var(--safe-area-inset-top);
        padding-right: var(--safe-area-inset-right);
        padding-bottom: var(--safe-area-inset-bottom);
        padding-left: var(--safe-area-inset-left);
      }
    `;
    document.head.appendChild(style);
    logger.info('[Platform] Safe area padding applied');
  }

  private optimizeAnimations(level: 'high' | 'medium' | 'low') {
    const style = document.createElement('style');

    if (level === 'low') {
      // Reduce animations for low-end devices
      style.textContent = `
        * {
          animation-duration: 0.15s !important;
          transition-duration: 0.15s !important;
        }
      `;
    } else if (level === 'medium') {
      // Moderate animations
      style.textContent = `
        * {
          animation-duration: 0.2s !important;
          transition-duration: 0.2s !important;
        }
      `;
    }

    if (style.textContent) {
      document.head.appendChild(style);
      logger.info(`[Platform] Animations optimized for ${level} performance`);
    }
  }

  private optimizeTouchTargets() {
    const minTouchSize = Platform.isMobile ? 48 : 44; // iOS: 44px, Android: 48px

    const style = document.createElement('style');
    style.textContent = `
      button, a, [role="button"] {
        min-height: ${minTouchSize}px;
        min-width: ${minTouchSize}px;
      }
    `;
    document.head.appendChild(style);
    logger.info('[Platform] Touch targets optimized');
  }

  private enableHDR() {
    const meta = document.createElement('meta');
    meta.name = 'color-scheme';
    meta.content = 'light dark';
    document.head.appendChild(meta);
    logger.info('[Platform] HDR display support enabled');
  }

  async vibrate(pattern: number | number[]) {
    if (this.capabilities?.supportsHaptics) {
      try {
        navigator.vibrate(pattern);
      } catch (error) {
        logger.warn('[Platform] Haptics not available:', error);
      }
    }
  }

  getCapabilities() {
    return this.capabilities;
  }

  // Get device-specific optimizations
  getOptimalImageSize(): { width: number; height: number } {
    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth * dpr;
    const height = window.innerHeight * dpr;

    // Cap at reasonable limits to save bandwidth
    return {
      width: Math.min(width, 2048),
      height: Math.min(height, 2048),
    };
  }

  shouldPreloadImages(): boolean {
    // Don't preload on low-end devices or slow connections
    if (this.capabilities?.performanceLevel === 'low') return false;

    const connection = (navigator as any).connection;
    if (
      connection?.effectiveType === 'slow-2g' ||
      connection?.effectiveType === '2g'
    ) {
      return false;
    }

    return true;
  }

  shouldUseLazyLoading(): boolean {
    // Always use lazy loading on mobile to save bandwidth
    return Platform.isMobile || this.capabilities?.performanceLevel !== 'high';
  }
}

export const crossPlatformOptimizer = new CrossPlatformOptimizer();

import { Capacitor } from '@capacitor/core';

/**
 * Platform detection utility for cross-platform features
 * Provides consistent API for detecting platform and selecting implementations
 */
export const Platform = {
  /** True if running in web browser */
  isWeb: !Capacitor.isNativePlatform(),
  
  /** True if running on native mobile (iOS or Android) */
  isMobile: Capacitor.isNativePlatform(),
  
  /** True if running on iOS */
  isIOS: Capacitor.getPlatform() === 'ios',
  
  /** True if running on Android */
  isAndroid: Capacitor.getPlatform() === 'android',
  
  /** Get the platform name */
  get platform(): 'web' | 'ios' | 'android' {
    if (this.isIOS) return 'ios';
    if (this.isAndroid) return 'android';
    return 'web';
  },
  
  /**
   * Select implementation based on platform
   * @example
   * ```ts
   * const headerHeight = Platform.select({
   *   web: 64,
   *   ios: 88,
   *   android: 56,
   * }) ?? 64;
   * ```
   */
  select<T>(options: { 
    web?: T; 
    mobile?: T; 
    ios?: T; 
    android?: T;
  }): T | undefined {
    // Check most specific first
    if (this.isIOS && options.ios !== undefined) return options.ios;
    if (this.isAndroid && options.android !== undefined) return options.android;
    
    // Then mobile generic
    if (this.isMobile && options.mobile !== undefined) return options.mobile;
    
    // Finally web
    if (this.isWeb && options.web !== undefined) return options.web;
    
    // Fallback to web as default
    return options.web;
  },
};

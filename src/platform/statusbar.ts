import { StatusBar, Style } from '@capacitor/status-bar';
import { Platform } from './detector';

/**
 * Unified status bar API for mobile platforms
 * Web: No-op (status bar doesn't exist)
 * Mobile: Native status bar control
 */

/**
 * Set status bar style
 */
export const setStyle = async (style: 'light' | 'dark'): Promise<void> => {
  if (Platform.isMobile) {
    try {
      await StatusBar.setStyle({
        style: style === 'light' ? Style.Light : Style.Dark,
      });
    } catch (error) {
      console.warn('Status bar style failed:', error);
    }
  }
};

/**
 * Set status bar background color (Android only)
 */
export const setBackgroundColor = async (color: string): Promise<void> => {
  if (Platform.isAndroid) {
    try {
      await StatusBar.setBackgroundColor({ color });
    } catch (error) {
      console.warn('Status bar background color failed:', error);
    }
  }
};

/**
 * Show status bar
 */
export const show = async (): Promise<void> => {
  if (Platform.isMobile) {
    try {
      await StatusBar.show();
    } catch (error) {
      console.warn('Status bar show failed:', error);
    }
  }
};

/**
 * Hide status bar
 */
export const hide = async (): Promise<void> => {
  if (Platform.isMobile) {
    try {
      await StatusBar.hide();
    } catch (error) {
      console.warn('Status bar hide failed:', error);
    }
  }
};

/**
 * Set status bar to overlay webview (iOS only)
 */
export const setOverlaysWebView = async (overlay: boolean): Promise<void> => {
  if (Platform.isIOS) {
    try {
      await StatusBar.setOverlaysWebView({ overlay });
    } catch (error) {
      console.warn('Status bar overlay failed:', error);
    }
  }
};

/**
 * React hook for managing status bar
 */
export const useStatusBar = (options: {
  style?: 'light' | 'dark';
  backgroundColor?: string;
  overlay?: boolean;
}) => {
  const { style = 'dark', backgroundColor, overlay } = options;

  // Apply status bar settings on mount
  if (Platform.isMobile) {
    if (style) {
      setStyle(style);
    }
    if (backgroundColor && Platform.isAndroid) {
      setBackgroundColor(backgroundColor);
    }
    if (overlay !== undefined && Platform.isIOS) {
      setOverlaysWebView(overlay);
    }
  }
};

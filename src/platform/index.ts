/**
 * Platform Adapters for Cross-Platform Compatibility
 * 
 * This module provides unified APIs that work seamlessly across web and mobile platforms.
 * Each adapter abstracts platform-specific implementations while maintaining consistent behavior.
 * 
 * Usage:
 * ```ts
 * import { Platform, Storage, camera, haptic } from '@/platform';
 * 
 * // Check platform
 * if (Platform.isMobile) {
 *   await haptic.success();
 * }
 * 
 * // Use storage
 * await Storage.set('key', 'value');
 * 
 * // Capture image
 * const image = await camera.captureImage();
 * ```
 */

export { Platform } from './detector';
export { Storage } from './storage';
export { 
  captureImage, 
  selectMultipleImages, 
  isCameraAvailable 
} from './camera';
export { 
  impact, 
  notification, 
  selection, 
  isHapticsAvailable, 
  vibratePattern,
  haptic 
} from './haptics';
export {
  share,
  canShare,
  copyToClipboard,
  shareStylistProfile,
  shareAppointment,
} from './share';
export {
  setStyle as setStatusBarStyle,
  setBackgroundColor as setStatusBarBackgroundColor,
  show as showStatusBar,
  hide as hideStatusBar,
  setOverlaysWebView,
  useStatusBar,
} from './statusbar';
export {
  show as showKeyboard,
  hide as hideKeyboard,
  setAccessoryBarVisible,
  setScroll as setKeyboardScroll,
  setStyle as setKeyboardStyle,
  useKeyboard,
  useKeyboardSpacing,
} from './keyboard';

// Re-export types
export type { KeyboardInfo } from '@capacitor/keyboard';

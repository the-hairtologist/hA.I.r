import { Keyboard, KeyboardInfo } from '@capacitor/keyboard';
import { Platform } from './detector';
import { useEffect, useState } from 'react';

/**
 * Unified keyboard API for mobile platforms
 * Web: No-op (virtual keyboard behavior is automatic)
 * Mobile: Native keyboard control and event handling
 */

/**
 * Show the keyboard
 */
export const show = async (): Promise<void> => {
  if (Platform.isMobile) {
    try {
      await Keyboard.show();
    } catch (error) {
      console.warn('Keyboard show failed:', error);
    }
  }
};

/**
 * Hide the keyboard
 */
export const hide = async (): Promise<void> => {
  if (Platform.isMobile) {
    try {
      await Keyboard.hide();
    } catch (error) {
      console.warn('Keyboard hide failed:', error);
    }
  }
};

/**
 * Set keyboard accessory bar visibility (iOS only)
 */
export const setAccessoryBarVisible = async (visible: boolean): Promise<void> => {
  if (Platform.isIOS) {
    try {
      await Keyboard.setAccessoryBarVisible({ isVisible: visible });
    } catch (error) {
      console.warn('Set accessory bar failed:', error);
    }
  }
};

/**
 * Set whether keyboard should scroll content (iOS only)
 */
export const setScroll = async (scroll: boolean): Promise<void> => {
  if (Platform.isIOS) {
    try {
      await Keyboard.setScroll({ isDisabled: !scroll });
    } catch (error) {
      console.warn('Set scroll failed:', error);
    }
  }
};

/**
 * Set keyboard style (iOS only)
 */
export const setStyle = async (style: 'dark' | 'light'): Promise<void> => {
  if (Platform.isIOS) {
    try {
      await Keyboard.setStyle({ style: style.toUpperCase() as any });
    } catch (error) {
      console.warn('Set keyboard style failed:', error);
    }
  }
};

/**
 * React hook for keyboard visibility state
 */
export const useKeyboard = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (!Platform.isMobile) {
      return;
    }

    let showHandle: any;
    let hideHandle: any;

    const setupListeners = async () => {
      showHandle = await Keyboard.addListener('keyboardWillShow', (info: KeyboardInfo) => {
        setIsVisible(true);
        setKeyboardHeight(info.keyboardHeight);
      });

      hideHandle = await Keyboard.addListener('keyboardWillHide', () => {
        setIsVisible(false);
        setKeyboardHeight(0);
      });
    };

    setupListeners();

    return () => {
      showHandle?.remove();
      hideHandle?.remove();
    };
  }, []);

  return { isVisible, keyboardHeight };
};

/**
 * React hook to adjust layout when keyboard appears
 */
export const useKeyboardSpacing = () => {
  const { isVisible, keyboardHeight } = useKeyboard();
  
  return {
    paddingBottom: isVisible && Platform.isMobile ? keyboardHeight : 0,
  };
};

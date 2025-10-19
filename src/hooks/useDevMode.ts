/**
 * Developer Mode Hook
 * Manages dev mode state and localStorage persistence
 */

import { useState, useEffect } from 'react';

const DEV_MODE_KEY = 'hair-dev-mode-enabled';

export function useDevMode() {
  const [isDevMode, setIsDevMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(DEV_MODE_KEY);
      return stored === 'true';
    } catch {
      return false;
    }
  });

  const toggleDevMode = () => {
    const newValue = !isDevMode;
    setIsDevMode(newValue);
    try {
      localStorage.setItem(DEV_MODE_KEY, String(newValue));
    } catch (error) {
      console.error('Failed to save dev mode preference:', error);
    }
  };

  return {
    isDevMode,
    toggleDevMode,
  };
}

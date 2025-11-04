/**
 * Accessibility Provider
 * Global accessibility context and utilities
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { LiveRegion } from './ScreenReaderOnly';

interface AccessibilityContextValue {
  announceToScreenReader: (message: string, politeness?: 'polite' | 'assertive') => void;
  reducedMotion: boolean;
  highContrast: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextValue | undefined>(
  undefined
);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({
  children,
}) => {
  const [announcement, setAnnouncement] = useState('');
  const [politeness, setPoliteness] = useState<'polite' | 'assertive'>('polite');

  // Detect user preferences
  const reducedMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const highContrast =
    window.matchMedia('(prefers-contrast: high)').matches;

  const announceToScreenReader = useCallback(
    (message: string, level: 'polite' | 'assertive' = 'polite') => {
      setPoliteness(level);
      setAnnouncement(message);

      // Clear after announcement
      setTimeout(() => setAnnouncement(''), 1000);
    },
    []
  );

  const value: AccessibilityContextValue = {
    announceToScreenReader,
    reducedMotion,
    highContrast,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {/* Live Region for Announcements */}
      <LiveRegion politeness={politeness}>
        {announcement}
      </LiveRegion>

      {children}
    </AccessibilityContext.Provider>
  );
};

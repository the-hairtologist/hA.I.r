/**
 * First Time User Detection Hook
 * Helps identify and provide guidance to new users
 */

import { useState, useEffect } from 'react';

interface FirstTimeUserState {
  isFirstTime: boolean;
  isFirstSession: boolean;
  sessionCount: number;
  hasCompletedTour: boolean;
  shouldShowOnboarding: boolean;
}

export const useFirstTimeUser = (): FirstTimeUserState => {
  const [state, setState] = useState<FirstTimeUserState>({
    isFirstTime: true,
    isFirstSession: true,
    sessionCount: 0,
    hasCompletedTour: false,
    shouldShowOnboarding: false,
  });

  useEffect(() => {
    // Check various localStorage flags
    const sessionCount = parseInt(localStorage.getItem('session_count') || '0');
    const hasCompletedTour = localStorage.getItem('tour_completed') === 'true';
    const lastVisit = localStorage.getItem('last_visit');
    const hasSeenWelcome = localStorage.getItem('has_seen_welcome');

    // Determine if this is truly a first-time user
    const isFirstTime = !hasSeenWelcome;
    const isFirstSession = sessionCount === 0;
    const shouldShowOnboarding = sessionCount < 3 && !hasCompletedTour;

    // Update last visit timestamp
    const now = new Date().toISOString();
    localStorage.setItem('last_visit', now);

    // Mark as having seen welcome if first time
    if (isFirstTime) {
      localStorage.setItem('has_seen_welcome', 'true');
    }

    setState({
      isFirstTime,
      isFirstSession,
      sessionCount,
      hasCompletedTour,
      shouldShowOnboarding,
    });
  }, []);

  return state;
};

/**
 * Mark a specific feature as discovered by the user
 */
export const markFeatureDiscovered = (featureName: string) => {
  const discovered = JSON.parse(localStorage.getItem('discovered_features') || '[]');
  
  if (!discovered.includes(featureName)) {
    discovered.push(featureName);
    localStorage.setItem('discovered_features', JSON.stringify(discovered));
  }
};

/**
 * Check if a feature has been discovered
 */
export const hasDiscoveredFeature = (featureName: string): boolean => {
  const discovered = JSON.parse(localStorage.getItem('discovered_features') || '[]');
  return discovered.includes(featureName);
};

/**
 * Reset all first-time user flags (useful for testing)
 */
export const resetFirstTimeFlags = () => {
  localStorage.removeItem('session_count');
  localStorage.removeItem('tour_completed');
  localStorage.removeItem('has_seen_welcome');
  localStorage.removeItem('discovered_features');
  localStorage.removeItem('quick_tips_dismissed');
  console.log('✅ First-time user flags reset');
};

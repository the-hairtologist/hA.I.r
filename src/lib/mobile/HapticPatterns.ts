/**
 * Phase 4: Enhanced Haptic Feedback Patterns
 * Rich haptic patterns for different interactions
 */

import { haptic } from '@/platform/haptics';

/**
 * Haptic pattern definitions
 */
export const hapticPatterns = {
  // Navigation
  navigation: {
    tap: () => haptic.tap(),
    swipe: () => haptic.impact('light'),
    longPress: () => haptic.impact('medium'),
  },

  // Actions
  actions: {
    success: async () => {
      await haptic.impact('light');
      await new Promise(resolve => setTimeout(resolve, 100));
      await haptic.impact('light');
    },
    error: async () => {
      await haptic.impact('heavy');
      await new Promise(resolve => setTimeout(resolve, 50));
      await haptic.impact('heavy');
    },
    warning: () => haptic.impact('medium'),
    buttonPress: () => haptic.tap(),
  },

  // Feedback
  feedback: {
    selection: () => haptic.tap(),
    toggle: () => haptic.impact('light'),
    slide: () => haptic.tap(),
  },

  // Special interactions
  special: {
    unlock: async () => {
      await haptic.impact('light');
      await new Promise(resolve => setTimeout(resolve, 50));
      await haptic.impact('medium');
      await new Promise(resolve => setTimeout(resolve, 50));
      await haptic.impact('heavy');
    },
    refresh: async () => {
      await haptic.impact('medium');
      await new Promise(resolve => setTimeout(resolve, 100));
      await haptic.impact('light');
    },
    delete: async () => {
      await haptic.impact('heavy');
      await new Promise(resolve => setTimeout(resolve, 150));
      await haptic.impact('heavy');
    },
  },

  // Progress
  progress: {
    step: () => haptic.tap(),
    complete: async () => {
      await haptic.impact('medium');
      await new Promise(resolve => setTimeout(resolve, 100));
      await haptic.impact('light');
      await new Promise(resolve => setTimeout(resolve, 100));
      await haptic.impact('light');
    },
  },

  // UI Elements
  ui: {
    drawer: () => haptic.impact('light'),
    modal: () => haptic.impact('medium'),
    dropdown: () => haptic.tap(),
    tab: () => haptic.tap(),
  },
};

/**
 * Contextual haptic feedback based on action type
 */
export function playHapticForAction(action: string) {
  const actionMap: Record<string, () => void> = {
    // Navigation
    'navigate': hapticPatterns.navigation.tap,
    'back': hapticPatterns.navigation.swipe,
    'menu': hapticPatterns.navigation.tap,

    // CRUD operations
    'create': hapticPatterns.actions.success,
    'save': hapticPatterns.actions.success,
    'update': hapticPatterns.actions.success,
    'delete': hapticPatterns.special.delete,

    // User interactions
    'click': hapticPatterns.actions.buttonPress,
    'select': hapticPatterns.feedback.selection,
    'toggle': hapticPatterns.feedback.toggle,
    'swipe': hapticPatterns.navigation.swipe,

    // Status feedback
    'success': hapticPatterns.actions.success,
    'error': hapticPatterns.actions.error,
    'warning': hapticPatterns.actions.warning,

    // Special
    'refresh': hapticPatterns.special.refresh,
    'unlock': hapticPatterns.special.unlock,
    'complete': hapticPatterns.progress.complete,
  };

  const hapticFunction = actionMap[action];
  if (hapticFunction) {
    hapticFunction();
  } else {
    // Default to light tap for unknown actions
    haptic.tap();
  }
}

/**
 * Haptic feedback for scroll position (subtle feedback at boundaries)
 */
export function hapticScrollFeedback(position: 'top' | 'bottom' | 'middle') {
  if (position === 'top' || position === 'bottom') {
    haptic.impact('light');
  }
}

/**
 * Haptic feedback for drag operations
 */
export const hapticDragFeedback = {
  start: () => haptic.impact('medium'),
  move: () => {}, // No haptic during move (would be overwhelming)
  drop: () => haptic.impact('light'),
  cancel: () => haptic.impact('light'),
};

/**
 * Haptic feedback for form validation
 */
export const hapticFormFeedback = {
  valid: () => haptic.impact('light'),
  invalid: () => haptic.impact('heavy'),
  submit: () => hapticPatterns.actions.success(),
};

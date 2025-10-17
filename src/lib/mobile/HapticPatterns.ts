/**
 * Phase 4: Enhanced Haptic Feedback Patterns
 * Rich haptic patterns for different interactions
 */

import { haptic, impact } from '@/platform/haptics';

/**
 * Haptic pattern definitions
 */
export const hapticPatterns = {
  // Navigation
  navigation: {
    tap: () => haptic.tap(),
    swipe: () => impact('light'),
    longPress: () => impact('medium'),
  },

  // Actions
  actions: {
    success: async () => {
      await impact('light');
      await new Promise(resolve => setTimeout(resolve, 100));
      await impact('light');
    },
    error: async () => {
      await impact('heavy');
      await new Promise(resolve => setTimeout(resolve, 50));
      await impact('heavy');
    },
    warning: () => impact('medium'),
    buttonPress: () => haptic.tap(),
  },

  // Feedback
  feedback: {
    selection: () => haptic.tap(),
    toggle: () => impact('light'),
    slide: () => haptic.tap(),
  },

  // Special interactions
  special: {
    unlock: async () => {
      await impact('light');
      await new Promise(resolve => setTimeout(resolve, 50));
      await impact('medium');
      await new Promise(resolve => setTimeout(resolve, 50));
      await impact('heavy');
    },
    refresh: async () => {
      await impact('medium');
      await new Promise(resolve => setTimeout(resolve, 100));
      await impact('light');
    },
    delete: async () => {
      await impact('heavy');
      await new Promise(resolve => setTimeout(resolve, 150));
      await impact('heavy');
    },
  },

  // Progress
  progress: {
    step: () => haptic.tap(),
    complete: async () => {
      await impact('medium');
      await new Promise(resolve => setTimeout(resolve, 100));
      await impact('light');
      await new Promise(resolve => setTimeout(resolve, 100));
      await impact('light');
    },
  },

  // UI Elements
  ui: {
    drawer: () => impact('light'),
    modal: () => impact('medium'),
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
    impact('light');
  }
}

/**
 * Haptic feedback for drag operations
 */
export const hapticDragFeedback = {
  start: () => impact('medium'),
  move: () => {}, // No haptic during move (would be overwhelming)
  drop: () => impact('light'),
  cancel: () => impact('light'),
};

/**
 * Haptic feedback for form validation
 */
export const hapticFormFeedback = {
  valid: () => impact('light'),
  invalid: () => impact('heavy'),
  submit: () => hapticPatterns.actions.success(),
};

/**
 * Focus Management Utilities
 * Handles focus trapping, restoration, and programmatic focus control
 */

/**
 * Focus Trap - Keeps focus within a container (e.g., modals, dialogs)
 */
export class FocusTrap {
  private container: HTMLElement;
  private previouslyFocused: HTMLElement | null = null;
  private isActive = false;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  /**
   * Get all focusable elements within the container
   */
  private getFocusableElements(): HTMLElement[] {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ');

    return Array.from(this.container.querySelectorAll(selector)).filter(
      (el) => {
        // Check if element is visible
        const element = el as HTMLElement;
        return (
          element.offsetParent !== null &&
          !element.hasAttribute('aria-hidden') &&
          getComputedStyle(element).visibility !== 'hidden'
        );
      }
    ) as HTMLElement[];
  }

  /**
   * Handle Tab key to trap focus
   */
  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    const focusableElements = this.getFocusableElements();
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      // Shift+Tab: Moving backwards
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab: Moving forwards
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  };

  /**
   * Activate focus trap
   */
  activate() {
    if (this.isActive) return;

    // Store previously focused element
    this.previouslyFocused = document.activeElement as HTMLElement;

    // Focus first focusable element
    const focusableElements = this.getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Add keyboard listener
    this.container.addEventListener('keydown', this.handleKeyDown);
    this.isActive = true;
  }

  /**
   * Deactivate focus trap and restore focus
   */
  deactivate() {
    if (!this.isActive) return;

    // Remove keyboard listener
    this.container.removeEventListener('keydown', this.handleKeyDown);

    // Restore focus to previously focused element
    if (this.previouslyFocused) {
      this.previouslyFocused.focus();
    }

    this.isActive = false;
  }
}

/**
 * Focus Stack - Manages focus restoration across multiple layers
 */
class FocusStack {
  private stack: HTMLElement[] = [];

  push(element: HTMLElement) {
    this.stack.push(element);
  }

  pop(): HTMLElement | undefined {
    return this.stack.pop();
  }

  peek(): HTMLElement | undefined {
    return this.stack[this.stack.length - 1];
  }

  clear() {
    this.stack = [];
  }

  isEmpty(): boolean {
    return this.stack.length === 0;
  }
}

export const focusStack = new FocusStack();

/**
 * Save current focus and return a function to restore it
 */
export function saveFocus(): () => void {
  const currentFocus = document.activeElement as HTMLElement;
  focusStack.push(currentFocus);

  return () => {
    const elementToFocus = focusStack.pop();
    if (elementToFocus && typeof elementToFocus.focus === 'function') {
      // Use setTimeout to ensure DOM is ready
      setTimeout(() => elementToFocus.focus(), 0);
    }
  };
}

/**
 * Focus the first focusable element in a container
 */
export function focusFirstElement(container: HTMLElement): boolean {
  const selector = [
    'button:not([disabled])',
    'a[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  const element = container.querySelector(selector) as HTMLElement;
  if (element) {
    element.focus();
    return true;
  }
  return false;
}

/**
 * Check if an element is focusable
 */
export function isFocusable(element: HTMLElement): boolean {
  if (
    element.hasAttribute('disabled') ||
    element.getAttribute('tabindex') === '-1' ||
    element.hasAttribute('aria-hidden')
  ) {
    return false;
  }

  const { visibility, display } = getComputedStyle(element);
  if (visibility === 'hidden' || display === 'none') {
    return false;
  }

  return true;
}

/**
 * Move focus to next/previous element
 */
export function moveFocus(
  direction: 'next' | 'previous',
  container: HTMLElement = document.body
): void {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  const focusableElements = Array.from(
    container.querySelectorAll(selector)
  ) as HTMLElement[];

  const currentIndex = focusableElements.indexOf(
    document.activeElement as HTMLElement
  );

  let nextIndex: number;
  if (direction === 'next') {
    nextIndex = (currentIndex + 1) % focusableElements.length;
  } else {
    nextIndex =
      (currentIndex - 1 + focusableElements.length) % focusableElements.length;
  }

  focusableElements[nextIndex]?.focus();
}

/**
 * Announce text to screen readers without visual output
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Create a skip link for keyboard navigation
 */
export function createSkipLink(
  text: string,
  targetId: string
): HTMLAnchorElement {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.textContent = text;
  skipLink.className =
    'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md';
  skipLink.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  return skipLink;
}

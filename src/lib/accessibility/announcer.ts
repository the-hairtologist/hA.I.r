/**
 * Live Region Announcer for Screen Readers
 * Following WCAG 2.2 AA guidelines for dynamic content
 */

import { safeConsole } from '@/lib/safeLogger';

type Priority = 'polite' | 'assertive';

class ScreenReaderAnnouncer {
  private politeRegion: HTMLDivElement | null = null;
  private assertiveRegion: HTMLDivElement | null = null;

  constructor() {
    if (typeof document !== 'undefined') {
      this.setupLiveRegions();
    }
  }

  /**
   * Create hidden live regions for announcements
   */
  private setupLiveRegions(): void {
    // Polite announcements (don't interrupt)
    this.politeRegion = document.createElement('div');
    this.politeRegion.setAttribute('role', 'status');
    this.politeRegion.setAttribute('aria-live', 'polite');
    this.politeRegion.setAttribute('aria-atomic', 'true');
    this.politeRegion.className = 'sr-only';
    document.body.appendChild(this.politeRegion);

    // Assertive announcements (interrupt immediately)
    this.assertiveRegion = document.createElement('div');
    this.assertiveRegion.setAttribute('role', 'alert');
    this.assertiveRegion.setAttribute('aria-live', 'assertive');
    this.assertiveRegion.setAttribute('aria-atomic', 'true');
    this.assertiveRegion.className = 'sr-only';
    document.body.appendChild(this.assertiveRegion);
  }

  /**
   * Announce message to screen readers
   * @param message - Text to announce
   * @param priority - 'polite' (default) or 'assertive' for urgent messages
   */
  announce(message: string, priority: Priority = 'polite'): void {
    const region =
      priority === 'assertive' ? this.assertiveRegion : this.politeRegion;

    if (!region) {
      safeConsole.warn('Live region not initialized');
      return;
    }

    // Clear previous message
    region.textContent = '';

    // Small delay ensures screen readers pick up the change
    setTimeout(() => {
      region.textContent = message;
    }, 100);

    // Auto-clear after 5 seconds to prevent stale announcements
    setTimeout(() => {
      if (region.textContent === message) {
        region.textContent = '';
      }
    }, 5000);
  }

  /**
   * Announce loading state
   */
  announceLoading(message: string = 'Loading...'): void {
    this.announce(message, 'polite');
  }

  /**
   * Announce success
   */
  announceSuccess(message: string): void {
    this.announce(`Success: ${message}`, 'polite');
  }

  /**
   * Announce error (urgent)
   */
  announceError(message: string): void {
    this.announce(`Error: ${message}`, 'assertive');
  }

  /**
   * Announce form validation error
   */
  announceValidationError(field: string, error: string): void {
    this.announce(`${field}: ${error}`, 'assertive');
  }

  /**
   * Announce navigation change
   */
  announceNavigation(pageName: string): void {
    this.announce(`Navigated to ${pageName}`, 'polite');
  }

  /**
   * Announce data update
   */
  announceDataUpdate(count: number, itemType: string): void {
    const plural = count !== 1 ? 's' : '';
    this.announce(
      `${count} ${itemType}${plural} ${count === 1 ? 'is' : 'are'} now available`,
      'polite'
    );
  }

  /**
   * Clean up on unmount
   */
  destroy(): void {
    this.politeRegion?.remove();
    this.assertiveRegion?.remove();
    this.politeRegion = null;
    this.assertiveRegion = null;
  }
}

// Export singleton instance
export const announcer = new ScreenReaderAnnouncer();

// Convenience exports
export const announce = announcer.announce.bind(announcer);
export const announceLoading = announcer.announceLoading.bind(announcer);
export const announceSuccess = announcer.announceSuccess.bind(announcer);
export const announceError = announcer.announceError.bind(announcer);
export const announceValidationError =
  announcer.announceValidationError.bind(announcer);
export const announceNavigation = announcer.announceNavigation.bind(announcer);
export const announceDataUpdate = announcer.announceDataUpdate.bind(announcer);

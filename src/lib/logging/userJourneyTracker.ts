/**
 * User Journey Tracker
 * Captures user navigation and actions to provide context for errors
 * Helps debug issues by showing what the user was doing before an error occurred
 */

interface JourneyEvent {
  timestamp: number;
  type: 'navigation' | 'action' | 'error' | 'api-call';
  description: string;
  route?: string;
  details?: Record<string, any>;
}

class UserJourneyTracker {
  private events: JourneyEvent[] = [];
  private maxEvents = 50; // Keep last 50 events
  private sessionStart = Date.now();

  /**
   * Track navigation between routes
   */
  trackNavigation(route: string, details?: Record<string, any>): void {
    this.addEvent({
      type: 'navigation',
      description: `Navigated to ${route}`,
      route,
      details,
    });
  }

  /**
   * Track user actions (button clicks, form submissions, etc.)
   */
  trackAction(action: string, details?: Record<string, any>): void {
    this.addEvent({
      type: 'action',
      description: action,
      details,
    });
  }

  /**
   * Track API calls
   */
  trackApiCall(method: string, endpoint: string, status: number, duration: number): void {
    this.addEvent({
      type: 'api-call',
      description: `${method} ${endpoint} - ${status} (${duration}ms)`,
      details: { method, endpoint, status, duration },
    });
  }

  /**
   * Track errors
   */
  trackError(error: Error | string, details?: Record<string, any>): void {
    this.addEvent({
      type: 'error',
      description: typeof error === 'string' ? error : error.message,
      details: {
        ...details,
        ...(error instanceof Error && { stack: error.stack }),
      },
    });
  }

  /**
   * Add event to journey
   */
  private addEvent(event: Omit<JourneyEvent, 'timestamp'>): void {
    this.events.push({
      ...event,
      timestamp: Date.now(),
    });

    // Trim to max events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }
  }

  /**
   * Get recent journey events
   */
  getRecentEvents(count: number = 10): JourneyEvent[] {
    return this.events.slice(-count);
  }

  /**
   * Get journey summary for error reporting
   */
  getJourneySummary(): {
    sessionDuration: number;
    totalEvents: number;
    recentEvents: JourneyEvent[];
    lastRoute?: string;
    errorCount: number;
  } {
    const sessionDuration = Date.now() - this.sessionStart;
    const errorCount = this.events.filter((e) => e.type === 'error').length;
    const lastNavigation = [...this.events]
      .reverse()
      .find((e) => e.type === 'navigation');

    return {
      sessionDuration,
      totalEvents: this.events.length,
      recentEvents: this.getRecentEvents(10),
      lastRoute: lastNavigation?.route,
      errorCount,
    };
  }

  /**
   * Get formatted journey for display
   */
  getFormattedJourney(): string {
    return this.events
      .map((event) => {
        const relativeTime = ((event.timestamp - this.sessionStart) / 1000).toFixed(1);
        return `[+${relativeTime}s] ${event.type.toUpperCase()}: ${event.description}`;
      })
      .join('\n');
  }

  /**
   * Clear journey history
   */
  clear(): void {
    this.events = [];
    this.sessionStart = Date.now();
  }

  /**
   * Export journey data
   */
  export(): JourneyEvent[] {
    return [...this.events];
  }
}

// Export singleton instance
export const userJourney = new UserJourneyTracker();

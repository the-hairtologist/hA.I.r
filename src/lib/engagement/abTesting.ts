/**
 * A/B Testing Engine - Phase 3: Engagement Layer
 * Simple variant testing with local state persistence
 */

export interface ABTest {
  id: string;
  name: string;
  variants: string[];
  weights?: number[]; // Optional weights for each variant (must sum to 1)
}

export interface UserVariant {
  testId: string;
  variant: string;
  assignedAt: number;
}

class ABTestingEngine {
  private static instance: ABTestingEngine;
  private storageKey = 'hair_ai_ab_tests';
  private assignments: Map<string, UserVariant> = new Map();

  private constructor() {
    this.loadAssignments();
  }

  static getInstance(): ABTestingEngine {
    if (!ABTestingEngine.instance) {
      ABTestingEngine.instance = new ABTestingEngine();
    }
    return ABTestingEngine.instance;
  }

  /**
   * Register a new A/B test
   */
  register(test: ABTest): void {
    // Validate weights if provided
    if (test.weights) {
      if (test.weights.length !== test.variants.length) {
        throw new Error('Weights array must match variants array length');
      }
      const sum = test.weights.reduce((a, b) => a + b, 0);
      if (Math.abs(sum - 1) > 0.001) {
        throw new Error('Weights must sum to 1');
      }
    }

    // Assign variant if not already assigned
    if (!this.assignments.has(test.id)) {
      const variant = this.assignVariant(test);
      this.assignments.set(test.id, {
        testId: test.id,
        variant,
        assignedAt: Date.now()
      });
      this.saveAssignments();
    }

    if (import.meta.env.DEV) {
      console.log(`🧪 A/B Test "${test.name}":`, this.getVariant(test.id));
    }
  }

  /**
   * Get user's assigned variant for a test
   */
  getVariant(testId: string): string | null {
    return this.assignments.get(testId)?.variant || null;
  }

  /**
   * Check if user is in a specific variant
   */
  isVariant(testId: string, variant: string): boolean {
    return this.getVariant(testId) === variant;
  }

  /**
   * Get all user assignments
   */
  getAllAssignments(): UserVariant[] {
    return Array.from(this.assignments.values());
  }

  /**
   * Clear all assignments (for testing)
   */
  clearAll(): void {
    this.assignments.clear();
    this.saveAssignments();
  }

  /**
   * Clear specific test assignment
   */
  clearTest(testId: string): void {
    this.assignments.delete(testId);
    this.saveAssignments();
  }

  /**
   * Assign a variant based on weights or random
   */
  private assignVariant(test: ABTest): string {
    const { variants, weights } = test;

    // Random assignment if no weights
    if (!weights) {
      return variants[Math.floor(Math.random() * variants.length)];
    }

    // Weighted random assignment
    const random = Math.random();
    let cumulative = 0;

    for (let i = 0; i < variants.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        return variants[i];
      }
    }

    // Fallback to last variant
    return variants[variants.length - 1];
  }

  /**
   * Load assignments from localStorage
   */
  private loadAssignments(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.assignments = new Map(Object.entries(data));
      }
    } catch (error) {
      console.error('Failed to load A/B test assignments:', error);
    }
  }

  /**
   * Save assignments to localStorage
   */
  private saveAssignments(): void {
    try {
      const data = Object.fromEntries(this.assignments);
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save A/B test assignments:', error);
    }
  }
}

export const abTesting = ABTestingEngine.getInstance();

/**
 * Initialize default A/B tests
 */
export function initABTesting(): void {
  // Example: Test different CTA button colors
  abTesting.register({
    id: 'cta-color',
    name: 'CTA Button Color',
    variants: ['primary', 'emerald', 'violet'],
    weights: [0.4, 0.3, 0.3] // 40% primary, 30% emerald, 30% violet
  });

  // Example: Test onboarding flow length
  abTesting.register({
    id: 'onboarding-flow',
    name: 'Onboarding Flow',
    variants: ['quick', 'detailed'],
    weights: [0.5, 0.5] // 50/50 split
  });

  // Example: Test dashboard layout
  abTesting.register({
    id: 'dashboard-layout',
    name: 'Dashboard Layout',
    variants: ['cards', 'list', 'compact']
  });

  if (import.meta.env.DEV) {
    (window as any).__abTests = () => console.table(abTesting.getAllAssignments());
    console.log('💡 Run __abTests() to see your A/B test variants');
  }
}

/**
 * React hook for A/B testing
 */
export function useABTest(testId: string): string | null {
  return abTesting.getVariant(testId);
}

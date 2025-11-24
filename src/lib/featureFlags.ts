/**
 * Feature Flags System
 * Allows safe rollout and rollback of new features
 */

export interface FeatureFlags {
  // Phase 1 Features
  FORMULA_VALIDATION: boolean;
  VISUAL_HAIR_ANALYSIS: boolean;
  SMART_MODEL_ROUTING: boolean;

  // Phase 2 Features
  QUICK_FORMULA_MODE: boolean;
  OUTCOME_TRACKING: boolean;
  LEARNING_LOOP: boolean;

  // Phase 3 Features
  PERSONALIZED_SUGGESTIONS: boolean;
  PREDICTIVE_INSIGHTS: boolean;
  SMART_FORMULA_LIBRARY: boolean;

  // System Features
  ANALYTICS_TRACKING: boolean;
  ERROR_MONITORING: boolean;
  PERFORMANCE_MONITORING: boolean;
}

// Default feature flags - can be overridden via environment or remote config
const DEFAULT_FLAGS: FeatureFlags = {
  // Phase 1 - Enabled (tested and stable)
  FORMULA_VALIDATION: true,
  VISUAL_HAIR_ANALYSIS: true,
  SMART_MODEL_ROUTING: true,

  // Phase 2 - Enabled (ready for production)
  QUICK_FORMULA_MODE: true,
  OUTCOME_TRACKING: true,
  LEARNING_LOOP: true,

  // Phase 3 - Enabled (production ready)
  PERSONALIZED_SUGGESTIONS: true,
  PREDICTIVE_INSIGHTS: true,
  SMART_FORMULA_LIBRARY: true,

  // System - Always enabled
  ANALYTICS_TRACKING: true,
  ERROR_MONITORING: true,
  PERFORMANCE_MONITORING: true,
};

class FeatureFlagManager {
  private flags: FeatureFlags;
  private overrides: Map<keyof FeatureFlags, boolean>;

  constructor() {
    this.flags = { ...DEFAULT_FLAGS };
    this.overrides = new Map();
    this.loadOverrides();
  }

  /**
   * Check if a feature is enabled
   */
  isEnabled(feature: keyof FeatureFlags): boolean {
    // Check localStorage override first (for testing/debugging)
    if (this.overrides.has(feature)) {
      return this.overrides.get(feature)!;
    }

    // Check environment variable override
    const envKey = `VITE_FEATURE_${feature}`;
    const envValue = import.meta.env[envKey];
    if (envValue !== undefined) {
      return envValue === 'true';
    }

    // Return default flag value
    return this.flags[feature];
  }

  /**
   * Override a feature flag (for testing)
   */
  setOverride(feature: keyof FeatureFlags, enabled: boolean): void {
    this.overrides.set(feature, enabled);
    localStorage.setItem(`feature_${feature}`, String(enabled));
  }

  /**
   * Clear feature flag override
   */
  clearOverride(feature: keyof FeatureFlags): void {
    this.overrides.delete(feature);
    localStorage.removeItem(`feature_${feature}`);
  }

  /**
   * Clear all overrides
   */
  clearAllOverrides(): void {
    this.overrides.clear();
    Object.keys(DEFAULT_FLAGS).forEach(feature => {
      localStorage.removeItem(`feature_${feature}`);
    });
  }

  /**
   * Load overrides from localStorage
   */
  private loadOverrides(): void {
    Object.keys(DEFAULT_FLAGS).forEach(feature => {
      const stored = localStorage.getItem(`feature_${feature}`);
      if (stored !== null) {
        this.overrides.set(feature as keyof FeatureFlags, stored === 'true');
      }
    });
  }

  /**
   * Get all feature flags status
   */
  getAllFlags(): FeatureFlags {
    const allFlags: any = {};
    Object.keys(DEFAULT_FLAGS).forEach(feature => {
      allFlags[feature] = this.isEnabled(feature as keyof FeatureFlags);
    });
    return allFlags as FeatureFlags;
  }
}

// Export singleton instance
export const featureFlags = new FeatureFlagManager();

// React hook for feature flags
import { useMemo } from 'react';

export function useFeatureFlag(feature: keyof FeatureFlags): boolean {
  return useMemo(() => featureFlags.isEnabled(feature), [feature]);
}

export function useFeatureFlags(): FeatureFlags {
  return useMemo(() => featureFlags.getAllFlags(), []);
}

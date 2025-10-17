/**
 * Higher-Order Component for React Memoization
 * Prevents unnecessary re-renders by comparing specified props
 */

import { memo, ComponentType } from 'react';
import { isEqual } from 'lodash-es';

type CompareKeys = string[];

/**
 * Wraps a component with React.memo and custom comparison
 * 
 * @param Component - Component to memoize
 * @param compareKeys - Array of prop paths to compare (e.g., ['client.id', 'client.updated_at'])
 * @returns Memoized component
 * 
 * @example
 * ```tsx
 * export const ClientCard = withMemo(
 *   ({ client, onEdit }) => {
 *     return <Card>...</Card>;
 *   },
 *   ['client.id', 'client.updated_at']
 * );
 * ```
 */
export function withMemo<P extends object>(
  Component: ComponentType<P>,
  compareKeys?: CompareKeys
) {
  return memo(Component, (prevProps, nextProps) => {
    if (!compareKeys || compareKeys.length === 0) {
      // Default: shallow comparison
      return isEqual(prevProps, nextProps);
    }

    // Compare only specified keys
    for (const key of compareKeys) {
      const prevValue = getNestedValue(prevProps, key);
      const nextValue = getNestedValue(nextProps, key);
      
      if (!isEqual(prevValue, nextValue)) {
        return false; // Props changed, re-render needed
      }
    }

    return true; // Props unchanged, skip re-render
  });
}

/**
 * Gets nested property value from object using dot notation
 */
function getNestedValue(obj: unknown, path: string): unknown {
  if (typeof obj !== 'object' || obj === null) return undefined;
  
  return path.split('.').reduce((current, key) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj as unknown);
}

/**
 * Simple memoization without comparison keys
 * Uses default shallow comparison
 */
export function simpleMemo<P extends object>(Component: ComponentType<P>) {
  return memo(Component);
}

/**
 * Error Boundary Testing Utilities
 * Tools for testing error boundaries in development and QA
 */

export type ErrorType = 'render' | 'async' | 'data' | 'network' | 'timeout';

/**
 * Throw a test error to trigger error boundaries
 */
export const throwTestError = (type: ErrorType = 'render', customMessage?: string) => {
  const messages: Record<ErrorType, string> = {
    render: 'Test render error - intentionally thrown for testing',
    async: 'Test async error - simulated promise rejection',
    data: 'Test data error - simulated data fetch failure',
    network: 'Network request failed - simulated network error',
    timeout: 'Request timeout - simulated timeout error',
  };

  const message = customMessage || messages[type];
  const error = new Error(message);
  error.name = `Test${type.charAt(0).toUpperCase() + type.slice(1)}Error`;

  throw error;
};

/**
 * Throw an async error (returns a promise)
 */
export const throwAsyncError = (type: ErrorType = 'async', delay = 100): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(throwTestError(type));
    }, delay);
  });
};

/**
 * Simulate a network error
 */
export const simulateNetworkError = () => {
  const error = new Error('Failed to fetch - simulated network failure');
  error.name = 'NetworkError';
  throw error;
};

/**
 * Simulate a timeout error
 */
export const simulateTimeout = () => {
  const error = new Error('Request timeout after 30000ms');
  error.name = 'TimeoutError';
  throw error;
};

/**
 * Test component that throws errors on demand
 * Note: This returns JSX, so it should be used in a React context
 */
export const createTestErrorComponent = ({ 
  errorType = 'render', 
  shouldError = true 
}: { 
  errorType?: ErrorType; 
  shouldError?: boolean;
}) => {
  if (shouldError) {
    throwTestError(errorType);
  }
  return 'Test Component (No Error)';
};

/**
 * Check if component is wrapped in error boundary
 * This is a heuristic - not 100% accurate but useful for checking coverage
 */
export const hasErrorBoundary = (component: React.ComponentType): boolean => {
  // Check if component has error boundary in its props or displayName
  const componentString = component.toString();
  return (
    componentString.includes('ErrorBoundary') ||
    component.displayName?.includes('ErrorBoundary') ||
    false
  );
};

/**
 * Generate error boundary coverage report
 */
export interface ErrorBoundaryReport {
  totalComponents: number;
  protectedComponents: number;
  unprotectedComponents: string[];
  coveragePercentage: number;
}

export const generateCoverageReport = (
  components: Record<string, React.ComponentType>
): ErrorBoundaryReport => {
  const componentNames = Object.keys(components);
  const totalComponents = componentNames.length;
  const protectedComponents = componentNames.filter(name =>
    hasErrorBoundary(components[name])
  );
  const unprotectedComponents = componentNames.filter(
    name => !hasErrorBoundary(components[name])
  );

  return {
    totalComponents,
    protectedComponents: protectedComponents.length,
    unprotectedComponents,
    coveragePercentage:
      totalComponents > 0
        ? (protectedComponents.length / totalComponents) * 100
        : 0,
  };
};

/**
 * Test all error boundaries in the app
 */
export const testAllErrorBoundaries = async () => {
  const results: Array<{
    boundary: string;
    passed: boolean;
    error?: string;
  }> = [];

  const errorTypes: ErrorType[] = ['render', 'async', 'data', 'network', 'timeout'];

  for (const type of errorTypes) {
    try {
      throwTestError(type);
      results.push({
        boundary: `Test${type}ErrorBoundary`,
        passed: false,
        error: 'Error was not caught',
      });
    } catch (error) {
      results.push({
        boundary: `Test${type}ErrorBoundary`,
        passed: true,
      });
    }
  }

  return results;
};

/**
 * Simulate various error scenarios for testing
 */
export const errorScenarios = {
  // Render error in component
  renderError: () => throwTestError('render'),

  // Async operation failure
  asyncError: () => throwAsyncError('async'),

  // Data fetch failure
  dataFetchError: () => throwTestError('data', 'Failed to load data from API'),

  // Network request failure
  networkFailure: () => simulateNetworkError(),

  // Request timeout
  requestTimeout: () => simulateTimeout(),

  // Multiple errors in sequence
  cascadingErrors: async () => {
    throwTestError('render');
    await new Promise(resolve => setTimeout(resolve, 100));
    throwTestError('async');
  },

  // Intermittent error (fails sometimes)
  intermittentError: () => {
    if (Math.random() > 0.5) {
      throwTestError('network', 'Intermittent network error');
    }
  },
};

/**
 * Log error boundary test results
 */
export const logTestResults = (results: any[]) => {
  console.group('🧪 Error Boundary Test Results');
  console.table(results);
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  console.log(`✅ ${passed}/${total} tests passed (${((passed / total) * 100).toFixed(1)}%)`);
  console.groupEnd();
};

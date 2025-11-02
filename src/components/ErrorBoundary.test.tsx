/**
 * Tests for ErrorBoundary component
 */

import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '@/lib/testing/testUtils';
import '@testing-library/jest-dom';
import { ErrorBoundary } from './ErrorBoundary';

// Component that throws an error
const ThrowError = () => {
  throw new Error('Test error');
};

// Component that renders successfully
const SafeComponent = () => <div>Safe content</div>;

describe('ErrorBoundary', () => {
  it('should render children when there is no error', () => {
    const { getByText } = renderWithProviders(
      <ErrorBoundary>
        <SafeComponent />
      </ErrorBoundary>
    );

    expect(getByText('Safe content')).toBeInTheDocument();
  });

  it('should catch errors and display fallback UI', () => {
    // Suppress console.error for this test
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const { getByText } = renderWithProviders(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(getByText(/something went wrong/i)).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });

  it('should render custom fallback when provided', () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const CustomFallback = () => <div>Custom error message</div>;

    const { getByText } = renderWithProviders(
      <ErrorBoundary fallback={<CustomFallback />}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(getByText('Custom error message')).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });
});

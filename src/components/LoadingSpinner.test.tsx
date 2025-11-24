import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '@/lib/testing/testUtils';
import { LoadingSpinner } from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default message', () => {
    const { container } = renderWithProviders(<LoadingSpinner />);

    expect(container.textContent).toContain('Just a moment...');
  });

  it('renders with custom message', () => {
    const { container } = renderWithProviders(<LoadingSpinner message="Please wait..." />);

    expect(container.textContent).toContain('Please wait...');
  });

  it('renders with different sizes', () => {
    const { container: small } = renderWithProviders(<LoadingSpinner size="sm" />);
    expect(small).toBeTruthy();

    const { container: large } = renderWithProviders(<LoadingSpinner size="lg" />);
    expect(large).toBeTruthy();
  });

  it('renders with status role', () => {
    const { container } = renderWithProviders(<LoadingSpinner />);
    const statusElement = container.querySelector('[role="status"]');

    expect(statusElement).toBeTruthy();
  });
});

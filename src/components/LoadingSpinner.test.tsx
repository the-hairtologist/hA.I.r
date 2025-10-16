import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { LoadingSpinner } from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default message', () => {
    const { container } = render(<LoadingSpinner />);
    
    expect(container.textContent).toContain('Just a moment...');
  });

  it('renders with custom message', () => {
    const { container } = render(<LoadingSpinner message="Please wait..." />);
    
    expect(container.textContent).toContain('Please wait...');
  });

  it('renders with different sizes', () => {
    const { container: small } = render(<LoadingSpinner size="sm" />);
    expect(small).toBeTruthy();
    
    const { container: large } = render(<LoadingSpinner size="lg" />);
    expect(large).toBeTruthy();
  });

  it('renders with status role', () => {
    const { container } = render(<LoadingSpinner />);
    const statusElement = container.querySelector('[role="status"]');
    
    expect(statusElement).toBeTruthy();
  });
});

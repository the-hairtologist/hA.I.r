/**
 * Example Test Suite
 * Demonstrates testing patterns for the application
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders, mockUser } from '@/lib/testing/testUtils';
import { Button } from '@/components/ui/button';

describe('Example Component Tests', () => {
  describe('Button Component', () => {
    it('renders with correct text', () => {
      renderWithProviders(<Button>Click Me</Button>);
      expect(screen.getByText('Click Me')).toBeInTheDocument();
    });

    it('handles click events', async () => {
      const handleClick = vi.fn();
      const { user } = renderWithProviders(
        <Button onClick={handleClick}>Click Me</Button>
      );
      
      await user.click(screen.getByText('Click Me'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('can be disabled', () => {
      renderWithProviders(<Button disabled>Disabled</Button>);
      expect(screen.getByText('Disabled')).toBeDisabled();
    });
  });

  describe('Authentication Flow', () => {
    it('displays user information when authenticated', () => {
      // Example test for authenticated state
      // This would use your actual auth components
      expect(mockUser.email).toBe('test@example.com');
    });
  });
});

describe('Accessibility Tests', () => {
  it('button has proper ARIA attributes', () => {
    renderWithProviders(
      <Button aria-label="Submit form">Submit</Button>
    );
    
    const button = screen.getByLabelText('Submit form');
    expect(button).toBeInTheDocument();
  });
});

describe('Performance Tests', () => {
  it('component renders within acceptable time', () => {
    const startTime = performance.now();
    renderWithProviders(<Button>Test</Button>);
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(100); // Should render in <100ms
  });
});

/**
 * Example Test Suite
 * Demonstrates testing patterns for the application
 */

import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen, mockUser } from '@/lib/testing/testUtils';

describe('Example Component Tests', () => {
  describe('Basic Rendering', () => {
    it('renders a simple div', () => {
      renderWithProviders(<div>Hello World</div>);
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('renders a basic button', () => {
      renderWithProviders(<button>Click Me</button>);
      expect(screen.getByRole('button', { name: 'Click Me' })).toBeInTheDocument();
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

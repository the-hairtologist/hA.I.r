import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { A11yTester } from '../A11yTester';

// Mock the environment
const mockEnv = vi.hoisted(() => ({
  PROD: false,
}));

vi.mock('virtual:env', () => ({
  import: {
    meta: {
      env: mockEnv,
    },
  },
}));

describe('A11yTester', () => {
  beforeEach(() => {
    // Reset environment to development mode
    mockEnv.PROD = false;
  });

  it('should not render in production', () => {
    mockEnv.PROD = true;
    const { container } = render(<A11yTester />);
    expect(container.firstChild).toBeNull();
  });

  it('should render in development mode', () => {
    render(<A11yTester />);
    expect(screen.getByRole('button', { name: /toggle accessibility tester/i })).toBeInTheDocument();
  });

  it('should toggle visibility when button is clicked', () => {
    render(<A11yTester />);
    
    const toggleButton = screen.getByRole('button', { name: /toggle accessibility tester/i });
    fireEvent.click(toggleButton);
    
    expect(screen.getByText(/accessibility scanner/i)).toBeInTheDocument();
  });

  it('should run accessibility audit when scan button is clicked', async () => {
    render(<A11yTester />);
    
    // Open the tester
    const toggleButton = screen.getByRole('button', { name: /toggle accessibility tester/i });
    fireEvent.click(toggleButton);
    
    // Run audit
    const scanButton = screen.getByRole('button', { name: /run accessibility scan/i });
    fireEvent.click(scanButton);
    
    // Wait for scan to complete
    await waitFor(() => {
      expect(screen.getByText(/scan complete/i)).toBeInTheDocument();
    });
  });

  it('should display accessibility issues after scan', async () => {
    // Add some test elements with accessibility issues
    document.body.innerHTML = `
      <img src="test.jpg" />
      <button></button>
      <input type="text" />
    `;
    
    render(<A11yTester />);
    
    // Open tester and run scan
    const toggleButton = screen.getByRole('button', { name: /toggle accessibility tester/i });
    fireEvent.click(toggleButton);
    
    const scanButton = screen.getByRole('button', { name: /run accessibility scan/i });
    fireEvent.click(scanButton);
    
    // Wait for scan and check for issues
    await waitFor(() => {
      expect(screen.getByText(/accessibility issues found/i)).toBeInTheDocument();
    });
  });

  it('should show WCAG compliance levels', async () => {
    render(<A11yTester />);
    
    const toggleButton = screen.getByRole('button', { name: /toggle accessibility tester/i });
    fireEvent.click(toggleButton);
    
    const scanButton = screen.getByRole('button', { name: /run accessibility scan/i });
    fireEvent.click(scanButton);
    
    await waitFor(() => {
      const wcagBadges = screen.getAllByText(/^(A|AA|AAA)$/);
      expect(wcagBadges.length).toBeGreaterThan(0);
    });
  });

  it('should provide fix suggestions for issues', async () => {
    render(<A11yTester />);
    
    const toggleButton = screen.getByRole('button', { name: /toggle accessibility tester/i });
    fireEvent.click(toggleButton);
    
    const scanButton = screen.getByRole('button', { name: /run accessibility scan/i });
    fireEvent.click(scanButton);
    
    await waitFor(() => {
      expect(screen.getByText(/suggestions/i)).toBeInTheDocument();
    });
  });
});
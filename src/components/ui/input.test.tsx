/**
 * Unit tests for Input component with validation states
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Input } from './input';

describe('Input', () => {
  it('should render input element', () => {
    const { container } = render(<Input placeholder="Enter text" />);
    const input = container.querySelector('input');
    expect(input).toBeInTheDocument();
    expect(input?.placeholder).toBe('Enter text');
  });

  it('should apply validation state styling for valid input', () => {
    const { container } = render(<Input validationState="valid" showValidationIcon={true} />);
    const input = container.querySelector('input');
    expect(input).toHaveClass('border-green-600');
  });

  it('should apply validation state styling for invalid input', () => {
    const { container } = render(<Input validationState="invalid" showValidationIcon={true} />);
    const input = container.querySelector('input');
    expect(input).toHaveClass('border-destructive');
  });

  it('should show validation icon when enabled', () => {
    const { container } = render(
      <Input 
        validationState="valid" 
        showValidationIcon={true} 
        data-testid="input-with-icon"
      />
    );
    
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('should not show validation icon by default', () => {
    const { container } = render(
      <Input validationState="valid" data-testid="input-without-icon" />
    );
    
    const icon = container.querySelector('svg');
    expect(icon).not.toBeInTheDocument();
  });

  it('should render with neutral state by default', () => {
    const { container } = render(<Input />);
    const input = container.querySelector('input');
    expect(input).not.toHaveClass('border-green-600');
    expect(input).not.toHaveClass('border-destructive');
  });

  it('should pass through standard input props', () => {
    const { container } = render(<Input type="email" required disabled value="test@example.com" readOnly />);
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.type).toBe('email');
    expect(input.required).toBe(true);
    expect(input.disabled).toBe(true);
    expect(input.value).toBe('test@example.com');
    expect(input.readOnly).toBe(true);
  });

  it('should render with custom className', () => {
    const { container } = render(<Input className="custom-class" />);
    const input = container.querySelector('input');
    expect(input).toHaveClass('custom-class');
  });

  it('should apply error styling when error prop is provided', () => {
    const { container } = render(<Input error="Invalid input" />);
    const input = container.querySelector('input');
    expect(input).toHaveClass('border-destructive');
    expect(input?.getAttribute('aria-invalid')).toBe('true');
  });
});

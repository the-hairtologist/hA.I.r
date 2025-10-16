/**
 * Unit tests for Input component with validation states
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from './input';

describe('Input', () => {
  it('should render input element', () => {
    render(<Input placeholder="Enter text" />);
    
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
  });

  it('should apply validation state styling for valid input', () => {
    render(<Input validationState="valid" showValidationIcon={true} />);
    
    const container = screen.getByRole('textbox').parentElement;
    expect(container).toHaveClass('border-green-500');
  });

  it('should apply validation state styling for invalid input', () => {
    render(<Input validationState="invalid" showValidationIcon={true} />);
    
    const container = screen.getByRole('textbox').parentElement;
    expect(container).toHaveClass('border-red-500');
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
    render(<Input />);
    
    const input = screen.getByRole('textbox');
    expect(input.parentElement).not.toHaveClass('border-green-500');
    expect(input.parentElement).not.toHaveClass('border-red-500');
  });

  it('should pass through standard input props', () => {
    render(<Input type="email" required disabled value="test@example.com" readOnly />);
    
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.type).toBe('email');
    expect(input.required).toBe(true);
    expect(input.disabled).toBe(true);
    expect(input.value).toBe('test@example.com');
    expect(input.readOnly).toBe(true);
  });

  it('should render with custom className', () => {
    render(<Input className="custom-class" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-class');
  });
});

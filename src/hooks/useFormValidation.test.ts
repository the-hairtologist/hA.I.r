import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFormValidation } from './useFormValidation';
import { z } from 'zod';

describe('useFormValidation', () => {
  const mockSchema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(1, 'Name is required'),
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useFormValidation({
        schema: mockSchema,
        onSubmit,
        initialValues: { email: '', password: '', name: '' },
      })
    );

    expect(result.current.values).toEqual({ email: '', password: '', name: '' });
    expect(result.current.errors).toEqual({});
    expect(result.current.isValid).toBe(false);
    expect(result.current.isSubmitting).toBe(false);
  });

  it('should handle field changes', () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useFormValidation({
        schema: mockSchema,
        onSubmit,
        initialValues: { email: '', password: '', name: '' },
      })
    );

    act(() => {
      result.current.handleChange('email', 'test@example.com');
    });

    expect(result.current.values.email).toBe('test@example.com');
    expect(result.current.touched.email).toBe(true);
  });

  it('should validate on blur', async () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useFormValidation({
        schema: mockSchema,
        onSubmit,
        initialValues: { email: '', password: '', name: '' },
      })
    );

    act(() => {
      result.current.handleChange('email', 'invalid');
      result.current.handleBlur('email');
    });

    await vi.waitFor(() => {
      expect(result.current.errors.email).toBe('Invalid email');
    });
  });

  it('should validate all fields on submit', async () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useFormValidation({
        schema: mockSchema,
        onSubmit,
        initialValues: { email: '', password: '', name: '' },
      })
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(Object.keys(result.current.errors).length).toBeGreaterThan(0);
  });

  it('should submit valid form', async () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useFormValidation({
        schema: mockSchema,
        onSubmit,
        initialValues: {
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        },
      })
    );

    await vi.waitFor(() => {
      expect(result.current.isValid).toBe(true);
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    });
  });

  it('should reset form', () => {
    const onSubmit = vi.fn();
    const initialValues = { email: '', password: '', name: '' };
    const { result } = renderHook(() =>
      useFormValidation({
        schema: mockSchema,
        onSubmit,
        initialValues,
      })
    );

    act(() => {
      result.current.handleChange('email', 'test@example.com');
      result.current.reset();
    });

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
  });

  it('should set field value programmatically', () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useFormValidation({
        schema: mockSchema,
        onSubmit,
        initialValues: { email: '', password: '', name: '' },
      })
    );

    act(() => {
      result.current.setFieldValue('email', 'new@example.com');
    });

    expect(result.current.values.email).toBe('new@example.com');
  });

  it('should set field error programmatically', () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useFormValidation({
        schema: mockSchema,
        onSubmit,
        initialValues: { email: '', password: '', name: '' },
      })
    );

    act(() => {
      result.current.setFieldError('email', 'Custom error');
    });

    expect(result.current.errors.email).toBe('Custom error');
  });

  it('should validate individual field', () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useFormValidation({
        schema: mockSchema,
        onSubmit,
        initialValues: { email: '', password: '', name: '' },
      })
    );

    const error = result.current.validateField('email', 'invalid');
    expect(error).toBe('Invalid email');

    const noError = result.current.validateField('email', 'valid@example.com');
    expect(noError).toBeNull();
  });
});

/**
 * Form State Management Hook
 * Handles complex form state with validation and submission
 */

import { useState, useCallback, useRef } from 'react';
import { log } from '@/lib/logger';

export interface FieldState<T = any> {
  value: T;
  error?: string;
  touched: boolean;
  dirty: boolean;
}

export interface FormState<T extends Record<string, any>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  dirty: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValidating: boolean;
  isValid: boolean;
  submitCount: number;
}

export interface UseFormStateOptions<T extends Record<string, any>> {
  initialValues: T;
  validate?: (values: T) => Partial<Record<keyof T, string>> | Promise<Partial<Record<keyof T, string>>>;
  onSubmit: (values: T) => void | Promise<void>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface UseFormStateReturn<T extends Record<string, any>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  dirty: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValidating: boolean;
  isValid: boolean;
  submitCount: number;
  
  // Methods
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setValues: (values: Partial<T>) => void;
  setError: (field: keyof T, error: string) => void;
  setErrors: (errors: Partial<Record<keyof T, string>>) => void;
  setTouched: (field: keyof T, touched?: boolean) => void;
  resetForm: (values?: Partial<T>) => void;
  validateField: (field: keyof T) => Promise<boolean>;
  validateForm: () => Promise<boolean>;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  getFieldProps: (field: keyof T) => {
    value: T[keyof T];
    onChange: (value: T[keyof T]) => void;
    onBlur: () => void;
    error?: string;
    touched?: boolean;
  };
}

export function useFormState<T extends Record<string, any>>(
  options: UseFormStateOptions<T>
): UseFormStateReturn<T> {
  const {
    initialValues,
    validate,
    onSubmit,
    validateOnChange = false,
    validateOnBlur = true,
  } = options;

  const initialValuesRef = useRef(initialValues);
  
  const [formState, setFormState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    dirty: {},
    isSubmitting: false,
    isValidating: false,
    isValid: true,
    submitCount: 0,
  });

  const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setFormState(prev => ({
      ...prev,
      values: { ...prev.values, [field]: value },
      dirty: { ...prev.dirty, [field]: true },
    }));

    if (validateOnChange && validate) {
      // Debounce validation
      setTimeout(() => validateField(field), 300);
    }
  }, [validate, validateOnChange]);

  const setValues = useCallback((values: Partial<T>) => {
    setFormState(prev => ({
      ...prev,
      values: { ...prev.values, ...values },
      dirty: Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), prev.dirty),
    }));
  }, []);

  const setError = useCallback((field: keyof T, error: string) => {
    setFormState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: error },
      isValid: false,
    }));
  }, []);

  const setErrors = useCallback((errors: Partial<Record<keyof T, string>>) => {
    setFormState(prev => ({
      ...prev,
      errors: { ...prev.errors, ...errors },
      isValid: Object.keys(errors).length === 0,
    }));
  }, []);

  const setTouched = useCallback((field: keyof T, touched: boolean = true) => {
    setFormState(prev => ({
      ...prev,
      touched: { ...prev.touched, [field]: touched },
    }));

    if (validateOnBlur && touched && validate) {
      validateField(field);
    }
  }, [validate, validateOnBlur]);

  const resetForm = useCallback((values?: Partial<T>) => {
    const newValues = values ? { ...initialValuesRef.current, ...values } : initialValuesRef.current;
    
    setFormState({
      values: newValues,
      errors: {},
      touched: {},
      dirty: {},
      isSubmitting: false,
      isValidating: false,
      isValid: true,
      submitCount: 0,
    });

    log.debug('Form reset', 'useFormState');
  }, []);

  const validateField = useCallback(async (field: keyof T): Promise<boolean> => {
    if (!validate) return true;

    try {
      setFormState(prev => ({ ...prev, isValidating: true }));

      const errors = await validate(formState.values);
      const fieldError = errors[field];

      setFormState(prev => ({
        ...prev,
        errors: { ...prev.errors, [field]: fieldError },
        isValidating: false,
      }));

      return !fieldError;
    } catch (error) {
      log.error('Field validation error', 'useFormState', error);
      return false;
    }
  }, [validate, formState.values]);

  const validateForm = useCallback(async (): Promise<boolean> => {
    if (!validate) return true;

    try {
      setFormState(prev => ({ ...prev, isValidating: true }));

      const errors = await validate(formState.values);
      const isValid = Object.keys(errors).length === 0;

      setFormState(prev => ({
        ...prev,
        errors,
        isValidating: false,
        isValid,
      }));

      log.debug('Form validation complete', 'useFormState', { isValid, errors });

      return isValid;
    } catch (error) {
      log.error('Form validation error', 'useFormState', error);
      setFormState(prev => ({ ...prev, isValidating: false }));
      return false;
    }
  }, [validate, formState.values]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    log.debug('Form submission started', 'useFormState');

    // Mark all fields as touched
    const allTouched = Object.keys(formState.values).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );

    setFormState(prev => ({
      ...prev,
      touched: allTouched,
      isSubmitting: true,
      submitCount: prev.submitCount + 1,
    }));

    // Validate form
    const isValid = await validateForm();

    if (!isValid) {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
      log.warn('Form submission blocked - validation failed', 'useFormState');
      return;
    }

    // Submit form
    try {
      await onSubmit(formState.values);
      log.info('Form submitted successfully', 'useFormState');
    } catch (error) {
      log.error('Form submission error', 'useFormState', error);
      throw error;
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [formState.values, validateForm, onSubmit]);

  const getFieldProps = useCallback((field: keyof T) => ({
    value: formState.values[field],
    onChange: (value: T[keyof T]) => setValue(field, value),
    onBlur: () => setTouched(field, true),
    error: formState.errors[field],
    touched: formState.touched[field],
  }), [formState, setValue, setTouched]);

  return {
    values: formState.values,
    errors: formState.errors,
    touched: formState.touched,
    dirty: formState.dirty,
    isSubmitting: formState.isSubmitting,
    isValidating: formState.isValidating,
    isValid: formState.isValid,
    submitCount: formState.submitCount,
    
    setValue,
    setValues,
    setError,
    setErrors,
    setTouched,
    resetForm,
    validateField,
    validateForm,
    handleSubmit,
    getFieldProps,
  };
}

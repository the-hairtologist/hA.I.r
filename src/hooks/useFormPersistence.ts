import { useEffect, useState } from 'react';
import { logger } from '@/lib/logging/productionLogger';

export const useFormPersistence = <T extends Record<string, any>>(
  key: string,
  initialValues: T
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(`form_${key}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setValues({ ...initialValues, ...parsed });
      } catch (e) {
        logger.error('Failed to parse stored form data', e, { component: 'useFormPersistence', key });
      }
    }
    setLoaded(true);
  }, [key]);

  // Save to localStorage on change
  useEffect(() => {
    if (loaded) {
      localStorage.setItem(`form_${key}`, JSON.stringify(values));
    }
  }, [key, values, loaded]);

  const updateValue = <K extends keyof T>(field: K, value: T[K]) => {
    setValues(prev => ({ ...prev, [field]: value }));
  };

  const clearPersistedData = () => {
    localStorage.removeItem(`form_${key}`);
    setValues(initialValues);
  };

  return { values, updateValue, clearPersistedData, loaded };
};

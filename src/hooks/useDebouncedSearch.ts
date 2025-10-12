/**
 * Debounced Search Hook
 * Prevents excessive queries while user is typing
 */

import { useState, useEffect, useCallback } from "react";

export const useDebouncedSearch = (initialValue = "", delay = 300) => {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  const [isDebouncing, setIsDebouncing] = useState(false);

  useEffect(() => {
    setIsDebouncing(true);
    const handler = setTimeout(() => {
      setDebouncedValue(value);
      setIsDebouncing(false);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  const reset = useCallback(() => {
    setValue("");
    setDebouncedValue("");
  }, []);

  return {
    value,
    debouncedValue,
    isDebouncing,
    setValue,
    reset,
  };
};
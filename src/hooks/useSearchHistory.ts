import { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';

const STORAGE_KEY = 'search_history';
const MAX_HISTORY = 5;

export const useSearchHistory = () => {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        logger.error(
          'Failed to parse search history',
          'useSearchHistory',
          e as Error
        );
      }
    }
  }, []);

  const addToHistory = (query: string) => {
    if (!query.trim()) return;

    const newHistory = [query, ...history.filter(h => h !== query)].slice(
      0,
      MAX_HISTORY
    );

    setHistory(newHistory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { history, addToHistory, clearHistory };
};

/**
 * Optimized Filtering Hook
 * Memoizes filtering and sorting operations for better performance
 */

import { useMemo } from 'react';

export interface FilterOptions {
  searchQuery?: string;
  sortBy?: string;
  filterBy?: Record<string, any>;
}

/**
 * Generic optimized filtering hook
 * Prevents unnecessary re-computations of filter/sort operations
 */
export function useOptimizedFiltering<T extends Record<string, any>>(
  items: T[],
  options: FilterOptions,
  searchFields: (keyof T)[] = []
) {
  return useMemo(() => {
    let filtered = [...items];

    // Apply search filter
    if (options.searchQuery && searchFields.length > 0) {
      const query = options.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(item =>
        searchFields.some(field => {
          const value = item[field];
          return value && String(value).toLowerCase().includes(query);
        })
      );
    }

    // Apply custom filters
    if (options.filterBy) {
      Object.entries(options.filterBy).forEach(([key, value]) => {
        if (value !== 'all' && value !== null && value !== undefined) {
          filtered = filtered.filter(item => item[key] === value);
        }
      });
    }

    // Apply sorting
    if (options.sortBy) {
      filtered.sort((a, b) => {
        const field = options.sortBy as keyof T;
        const aVal = a[field];
        const bVal = b[field];

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return aVal.localeCompare(bVal);
        }
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return aVal - bVal;
        }
        return 0;
      });
    }

    return filtered;
  }, [items, options, searchFields]);
}

/**
 * Client-specific optimized filtering
 */
export function useOptimizedClientFiltering(
  clients: any[],
  searchQuery: string,
  sortBy: string,
  riskFilter: string
) {
  return useMemo(() => {
    let filtered = [...clients];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        client =>
          client.full_name?.toLowerCase().includes(query) ||
          client.email?.toLowerCase().includes(query) ||
          client.phone?.includes(query)
      );
    }

    // Risk filter
    if (riskFilter !== 'all') {
      const dayThreshold = parseInt(riskFilter);
      filtered = filtered.filter(client => {
        if (!client.last_appointment_date) return true;
        const daysSince = Math.floor(
          (new Date().getTime() -
            new Date(client.last_appointment_date).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        return daysSince >= dayThreshold;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.full_name || '').localeCompare(b.full_name || '');
        case 'recent': {
          const dateA = a.last_appointment_date
            ? new Date(a.last_appointment_date).getTime()
            : 0;
          const dateB = b.last_appointment_date
            ? new Date(b.last_appointment_date).getTime()
            : 0;
          return dateB - dateA;
        }
        case 'inactive': {
          const daysA = a.last_appointment_date
            ? Math.floor(
                (new Date().getTime() -
                  new Date(a.last_appointment_date).getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            : 999999;
          const daysB = b.last_appointment_date
            ? Math.floor(
                (new Date().getTime() -
                  new Date(b.last_appointment_date).getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            : 999999;
          return daysB - daysA;
        }
        default:
          return 0;
      }
    });

    return filtered;
  }, [clients, searchQuery, sortBy, riskFilter]);
}

/**
 * Unit tests for usePagination hook
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePagination } from './usePagination';

describe('usePagination', () => {
  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => usePagination({
      totalItems: 100,
      itemsPerPage: 25
    }));

    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(4);
    expect(result.current.startIndex).toBe(0);
    expect(result.current.endIndex).toBe(25);
    expect(result.current.hasNextPage).toBe(true);
    expect(result.current.hasPreviousPage).toBe(false);
  });

  it('should navigate to next page correctly', () => {
    const { result } = renderHook(() => usePagination({
      totalItems: 100,
      itemsPerPage: 25
    }));

    act(() => {
      result.current.goToNextPage();
    });

    expect(result.current.currentPage).toBe(2);
    expect(result.current.startIndex).toBe(25);
    expect(result.current.endIndex).toBe(50);
    expect(result.current.hasNextPage).toBe(true);
    expect(result.current.hasPreviousPage).toBe(true);
  });

  it('should navigate to previous page correctly', () => {
    const { result } = renderHook(() => usePagination({
      totalItems: 100,
      itemsPerPage: 25,
      initialPage: 3
    }));

    act(() => {
      result.current.goToPreviousPage();
    });

    expect(result.current.currentPage).toBe(2);
    expect(result.current.startIndex).toBe(25);
    expect(result.current.endIndex).toBe(50);
  });

  it('should not go beyond last page', () => {
    const { result } = renderHook(() => usePagination({
      totalItems: 100,
      itemsPerPage: 25,
      initialPage: 4
    }));

    act(() => {
      result.current.goToNextPage();
    });

    expect(result.current.currentPage).toBe(4);
    expect(result.current.hasNextPage).toBe(false);
  });

  it('should not go before first page', () => {
    const { result } = renderHook(() => usePagination({
      totalItems: 100,
      itemsPerPage: 25
    }));

    act(() => {
      result.current.goToPreviousPage();
    });

    expect(result.current.currentPage).toBe(1);
    expect(result.current.hasPreviousPage).toBe(false);
  });

  it('should jump to specific page', () => {
    const { result } = renderHook(() => usePagination({
      totalItems: 100,
      itemsPerPage: 25
    }));

    act(() => {
      result.current.goToPage(3);
    });

    expect(result.current.currentPage).toBe(3);
    expect(result.current.startIndex).toBe(50);
    expect(result.current.endIndex).toBe(75);
  });

  it('should change page size and reset to page 1', () => {
    const { result } = renderHook(() => usePagination({
      totalItems: 100,
      itemsPerPage: 25,
      initialPage: 3
    }));

    act(() => {
      result.current.setPageSize(50);
    });

    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(2);
    expect(result.current.endIndex).toBe(50);
  });

  it('should calculate total pages correctly with remainder', () => {
    const { result } = renderHook(() => usePagination({
      totalItems: 105,
      itemsPerPage: 25
    }));

    expect(result.current.totalPages).toBe(5);
  });

  it('should handle zero items', () => {
    const { result } = renderHook(() => usePagination({
      totalItems: 0,
      itemsPerPage: 25
    }));

    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(0);
    expect(result.current.startIndex).toBe(0);
    expect(result.current.endIndex).toBe(0);
    expect(result.current.hasNextPage).toBe(false);
    expect(result.current.hasPreviousPage).toBe(false);
  });

  it('should generate correct page numbers', () => {
    const { result } = renderHook(() => usePagination({
      totalItems: 100,
      itemsPerPage: 10
    }));

    expect(result.current.pageNumbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });
});

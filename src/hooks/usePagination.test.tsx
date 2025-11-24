/**
 * Unit tests for usePagination hook
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@/lib/testing/testUtils';
import { usePagination } from './usePagination';

describe('usePagination', () => {
  it('should initialize with correct default values', () => {
    const { result } = renderHook(() =>
      usePagination({
        totalItems: 100,
        initialPageSize: 25,
      })
    );

    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(4);
    expect(result.current.startIndex).toBe(0);
    expect(result.current.endIndex).toBe(25);
    expect(result.current.canGoNext).toBe(true);
    expect(result.current.canGoPrevious).toBe(false);
  });

  it('should navigate to next page correctly', () => {
    const { result } = renderHook(() =>
      usePagination({
        totalItems: 100,
        initialPageSize: 25,
      })
    );

    act(() => {
      result.current.nextPage();
    });

    expect(result.current.currentPage).toBe(2);
    expect(result.current.startIndex).toBe(25);
    expect(result.current.endIndex).toBe(50);
    expect(result.current.canGoNext).toBe(true);
    expect(result.current.canGoPrevious).toBe(true);
  });

  it('should navigate to previous page correctly', () => {
    const { result } = renderHook(() =>
      usePagination({
        totalItems: 100,
        initialPageSize: 25,
        initialPage: 3,
      })
    );

    act(() => {
      result.current.previousPage();
    });

    expect(result.current.currentPage).toBe(2);
    expect(result.current.startIndex).toBe(25);
    expect(result.current.endIndex).toBe(50);
  });

  it('should not go beyond last page', () => {
    const { result } = renderHook(() =>
      usePagination({
        totalItems: 100,
        initialPageSize: 25,
        initialPage: 4,
      })
    );

    act(() => {
      result.current.nextPage();
    });

    expect(result.current.currentPage).toBe(4);
    expect(result.current.canGoNext).toBe(false);
  });

  it('should not go before first page', () => {
    const { result } = renderHook(() =>
      usePagination({
        totalItems: 100,
        initialPageSize: 25,
      })
    );

    act(() => {
      result.current.previousPage();
    });

    expect(result.current.currentPage).toBe(1);
    expect(result.current.canGoPrevious).toBe(false);
  });

  it('should jump to specific page', () => {
    const { result } = renderHook(() =>
      usePagination({
        totalItems: 100,
        initialPageSize: 25,
      })
    );

    act(() => {
      result.current.goToPage(3);
    });

    expect(result.current.currentPage).toBe(3);
    expect(result.current.startIndex).toBe(50);
    expect(result.current.endIndex).toBe(75);
  });

  it('should change page size and reset to page 1', () => {
    const { result } = renderHook(() =>
      usePagination({
        totalItems: 100,
        initialPageSize: 25,
        initialPage: 3,
      })
    );

    act(() => {
      result.current.setPageSize(50);
    });

    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(2);
    expect(result.current.endIndex).toBe(50);
  });

  it('should calculate total pages correctly with remainder', () => {
    const { result } = renderHook(() =>
      usePagination({
        totalItems: 105,
        initialPageSize: 25,
      })
    );

    expect(result.current.totalPages).toBe(5);
  });

  it('should handle zero items', () => {
    const { result } = renderHook(() =>
      usePagination({
        totalItems: 0,
        initialPageSize: 25,
      })
    );

    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(1);
    expect(result.current.startIndex).toBe(0);
    expect(result.current.endIndex).toBe(0);
    expect(result.current.canGoNext).toBe(false);
    expect(result.current.canGoPrevious).toBe(false);
  });

  it('should paginate data correctly', () => {
    const { result } = renderHook(() =>
      usePagination({
        totalItems: 10,
        initialPageSize: 3,
      })
    );

    const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    expect(result.current.getPaginatedData(data)).toEqual([1, 2, 3]);

    act(() => {
      result.current.nextPage();
    });

    expect(result.current.getPaginatedData(data)).toEqual([4, 5, 6]);
  });

  it('should provide correct pagination info', () => {
    const { result } = renderHook(() =>
      usePagination({
        totalItems: 100,
        initialPageSize: 25,
      })
    );

    expect(result.current.paginationInfo).toBe('Showing 1-25 of 100');

    act(() => {
      result.current.goToPage(2);
    });

    expect(result.current.paginationInfo).toBe('Showing 26-50 of 100');
  });
});

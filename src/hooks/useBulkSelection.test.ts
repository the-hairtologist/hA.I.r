import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBulkSelection } from './useBulkSelection';

describe('useBulkSelection', () => {
  const mockItems = [
    { id: '1', name: 'Item 1' },
    { id: '2', name: 'Item 2' },
    { id: '3', name: 'Item 3' },
  ];

  it('should initialize with no selections', () => {
    const { result } = renderHook(() => useBulkSelection(mockItems));
    
    expect(result.current.selectedCount).toBe(0);
    expect(result.current.selectedIds.size).toBe(0);
  });

  it('should toggle selection', () => {
    const { result } = renderHook(() => useBulkSelection(mockItems));
    
    act(() => {
      result.current.toggleSelection('1');
    });

    expect(result.current.isSelected('1')).toBe(true);
    expect(result.current.selectedCount).toBe(1);
  });

  it('should clear all selections', () => {
    const { result } = renderHook(() => useBulkSelection(mockItems));
    
    act(() => {
      result.current.toggleSelection('1');
      result.current.toggleSelection('2');
    });

    expect(result.current.selectedCount).toBe(2);

    act(() => {
      result.current.clearSelection();
    });

    expect(result.current.selectedCount).toBe(0);
  });
});

/**
 * Unit tests for apiClient wrapper
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { withQueryRetry, apiClient } from './apiClient';

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    info: vi.fn(),
    error: vi.fn(),
    success: vi.fn()
  }
}));

vi.mock('./logger', () => ({
  log: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}));

vi.mock('./errorHandler', () => ({
  withRetry: vi.fn((fn) => fn())
}));

describe('apiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('withQueryRetry', () => {
    it('should execute query successfully', async () => {
      const mockQuery = vi.fn().mockResolvedValue({ data: 'test', error: null });
      
      const result = await withQueryRetry(mockQuery);
      
      expect(result).toEqual({ data: 'test', error: null });
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    it('should handle errors from query', async () => {
      const mockQuery = vi.fn().mockResolvedValue({ 
        data: null, 
        error: new Error('Query failed') 
      });
      
      const result = await withQueryRetry(mockQuery);
      
      expect(result.error).toBeDefined();
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });
  });

  describe('apiClient.query', () => {
    it('should return data when query succeeds', async () => {
      const mockData = [{ id: 1, name: 'Test' }];
      const mockQueryFn = vi.fn().mockResolvedValue({ data: mockData, error: null });
      
      const result = await apiClient.query(mockQueryFn);
      
      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
    });

    it('should throw error when query fails', async () => {
      const mockError = new Error('Database error');
      const mockQueryFn = vi.fn().mockResolvedValue({ data: null, error: mockError });
      
      await expect(apiClient.query(mockQueryFn)).rejects.toThrow('Database error');
    });
  });

  describe('apiClient.parallel', () => {
    it('should execute multiple queries in parallel', async () => {
      const query1 = vi.fn().mockResolvedValue({ data: 'result1', error: null });
      const query2 = vi.fn().mockResolvedValue({ data: 'result2', error: null });
      
      const results = await apiClient.parallel([query1, query2]);
      
      expect(results).toHaveLength(2);
      expect(query1).toHaveBeenCalled();
      expect(query2).toHaveBeenCalled();
    });

    it('should handle mixed success and failure', async () => {
      const query1 = vi.fn().mockResolvedValue({ data: 'result1', error: null });
      const query2 = vi.fn().mockRejectedValue(new Error('Failed'));
      
      await expect(apiClient.parallel([query1, query2])).rejects.toThrow();
    });
  });
});

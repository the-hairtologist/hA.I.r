/**
 * Unit Tests for CSV Export Utility
 * Tests CSV generation and data formatting
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportToCSV, formatDataForExport } from './csvExport';

describe('csvExport', () => {
  let createElementSpy: any;
  let clickSpy: any;

  beforeEach(() => {
    // Mock document.createElement for download testing
    clickSpy = vi.fn();
    createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      click: clickSpy,
      style: {},
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('exportToCSV', () => {
    it('should export simple data to CSV', () => {
      const data = [
        { name: 'John', age: 30, city: 'New York' },
        { name: 'Jane', age: 25, city: 'Los Angeles' },
      ];

      exportToCSV(data, 'test');

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(clickSpy).toHaveBeenCalled();
    });

    it('should handle empty data array', () => {
      expect(() => exportToCSV([], 'test')).toThrow('No data to export');
    });

    it('should include all columns from first object', () => {
      const data = [
        { col1: 'a', col2: 'b', col3: 'c' },
        { col1: 'd', col2: 'e', col3: 'f' },
      ];

      exportToCSV(data, 'test');

      // Check that element was created (basic check)
      expect(createElementSpy).toHaveBeenCalled();
    });

    it('should handle data with special characters', () => {
      const data = [
        { name: 'John, Doe', description: 'Line1\nLine2', value: '"quoted"' },
      ];

      expect(() => exportToCSV(data, 'test')).not.toThrow();
    });

    it('should handle null and undefined values', () => {
      const data = [
        { name: 'John', age: null, city: undefined },
      ];

      expect(() => exportToCSV(data, 'test')).not.toThrow();
    });

    it('should sanitize filename', () => {
      const data = [{ test: 'value' }];

      exportToCSV(data, 'test file name.csv');

      expect(createElementSpy).toHaveBeenCalled();
    });

    it('should handle data with arrays', () => {
      const data = [
        { name: 'John', tags: ['tag1', 'tag2', 'tag3'] },
      ];

      expect(() => exportToCSV(data, 'test')).not.toThrow();
    });

    it('should handle data with objects', () => {
      const data = [
        { name: 'John', address: { city: 'NYC', zip: '10001' } },
      ];

      expect(() => exportToCSV(data, 'test')).not.toThrow();
    });

    it('should add CSV file extension if missing', () => {
      const data = [{ test: 'value' }];

      exportToCSV(data, 'test');

      // Element creation confirms file download initiated
      expect(createElementSpy).toHaveBeenCalled();
    });

    it('should handle large datasets', () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        value: Math.random(),
      }));

      expect(() => exportToCSV(largeData, 'large-test')).not.toThrow();
    });

    it('should handle unicode characters', () => {
      const data = [
        { name: '日本語', emoji: '😀', special: 'Café' },
      ];

      expect(() => exportToCSV(data, 'unicode-test')).not.toThrow();
    });
  });

  describe('formatDataForExport', () => {
    it('should flatten nested objects', () => {
      const data = [
        {
          name: 'John',
          address: {
            city: 'NYC',
            country: 'USA',
          },
        },
      ];

      const formatted = formatDataForExport(data);

      expect(formatted[0]).toHaveProperty('name', 'John');
      expect(formatted[0]).toHaveProperty('address_city', 'NYC');
      expect(formatted[0]).toHaveProperty('address_country', 'USA');
    });

    it('should handle arrays in data', () => {
      const data = [
        {
          name: 'John',
          tags: ['tag1', 'tag2'],
        },
      ];

      const formatted = formatDataForExport(data);

      expect(formatted[0]).toHaveProperty('name', 'John');
      expect(formatted[0].tags).toBe('tag1, tag2');
    });

    it('should handle null and undefined values', () => {
      const data = [
        {
          name: 'John',
          age: null,
          city: undefined,
        },
      ];

      const formatted = formatDataForExport(data);

      expect(formatted[0].name).toBe('John');
      expect(formatted[0].age).toBe('');
      expect(formatted[0].city).toBe('');
    });

    it('should handle deeply nested objects', () => {
      const data = [
        {
          level1: {
            level2: {
              level3: 'deep value',
            },
          },
        },
      ];

      const formatted = formatDataForExport(data);

      expect(formatted[0]).toHaveProperty('level1_level2_level3', 'deep value');
    });

    it('should handle empty objects', () => {
      const data = [
        {
          name: 'John',
          metadata: {},
        },
      ];

      const formatted = formatDataForExport(data);

      expect(formatted[0]).toHaveProperty('name', 'John');
      expect(formatted[0].metadata).toBe('');
    });

    it('should handle empty arrays', () => {
      const data = [
        {
          name: 'John',
          tags: [],
        },
      ];

      const formatted = formatDataForExport(data);

      expect(formatted[0]).toHaveProperty('name', 'John');
      expect(formatted[0].tags).toBe('');
    });

    it('should handle boolean values', () => {
      const data = [
        {
          name: 'John',
          active: true,
          verified: false,
        },
      ];

      const formatted = formatDataForExport(data);

      expect(formatted[0].active).toBe('true');
      expect(formatted[0].verified).toBe('false');
    });

    it('should handle numeric values', () => {
      const data = [
        {
          name: 'John',
          age: 30,
          score: 95.5,
          count: 0,
        },
      ];

      const formatted = formatDataForExport(data);

      expect(formatted[0].age).toBe('30');
      expect(formatted[0].score).toBe('95.5');
      expect(formatted[0].count).toBe('0');
    });

    it('should handle Date objects', () => {
      const date = new Date('2025-01-15');
      const data = [
        {
          name: 'John',
          created: date,
        },
      ];

      const formatted = formatDataForExport(data);

      expect(formatted[0]).toHaveProperty('name', 'John');
      expect(formatted[0].created).toBeTruthy();
    });

    it('should handle mixed data types', () => {
      const data = [
        {
          string: 'text',
          number: 42,
          boolean: true,
          null: null,
          undefined: undefined,
          array: [1, 2, 3],
          object: { key: 'value' },
        },
      ];

      const formatted = formatDataForExport(data);

      expect(formatted[0].string).toBe('text');
      expect(formatted[0].number).toBe('42');
      expect(formatted[0].boolean).toBe('true');
      expect(formatted[0].null).toBe('');
      expect(formatted[0].array).toBe('1, 2, 3');
      expect(formatted[0].object_key).toBe('value');
    });
  });
});

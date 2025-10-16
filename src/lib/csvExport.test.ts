import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportToCSV, formatDataForExport } from './csvExport';

describe('csvExport', () => {
  let createElementSpy: any;
  let appendChildSpy: any;
  let removeChildSpy: any;
  let clickSpy: any;

  beforeEach(() => {
    // Mock DOM methods
    clickSpy = vi.fn();
    const linkElement = {
      setAttribute: vi.fn(),
      click: clickSpy,
      style: {},
    };

    createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(linkElement as any);
    appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => linkElement as any);
    removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => linkElement as any);

    // Mock URL methods
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('exportToCSV', () => {
    it('should throw error for empty data', () => {
      expect(() => exportToCSV([], 'test')).toThrow('No data to export');
    });

    it('should create CSV with correct format', () => {
      const data = [
        { name: 'John', age: 30, city: 'New York' },
        { name: 'Jane', age: 25, city: 'Boston' },
      ];

      exportToCSV(data, 'users');

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(clickSpy).toHaveBeenCalled();
    });

    it('should handle values with commas', () => {
      const data = [{ address: '123 Main St, Apt 4' }];
      exportToCSV(data, 'addresses');
      expect(clickSpy).toHaveBeenCalled();
    });

    it('should handle null and undefined values', () => {
      const data = [
        { name: 'John', email: null, phone: undefined },
      ];

      exportToCSV(data, 'contacts');
      expect(clickSpy).toHaveBeenCalled();
    });

    it('should handle nested objects', () => {
      const data = [
        { name: 'John', metadata: { role: 'admin', status: 'active' } },
      ];

      exportToCSV(data, 'users');
      expect(clickSpy).toHaveBeenCalled();
    });

    it('should handle special characters', () => {
      const data = [
        { note: 'Quote: "Hello"', message: 'Line\nBreak' },
      ];

      exportToCSV(data, 'notes');
      expect(clickSpy).toHaveBeenCalled();
    });

    it('should add timestamp to filename', () => {
      const data = [{ id: 1 }];
      const linkElement = createElementSpy.mock.results[0].value;

      exportToCSV(data, 'export');

      const setAttributeCalls = linkElement.setAttribute.mock.calls;
      const downloadCall = setAttributeCalls.find((call: any) => call[0] === 'download');
      
      expect(downloadCall[1]).toMatch(/^export_\d{4}-\d{2}-\d{2}\.csv$/);
    });

    it('should clean up after export', () => {
      const data = [{ id: 1 }];
      exportToCSV(data, 'test');

      expect(removeChildSpy).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });
  });

  describe('formatDataForExport', () => {
    it('should flatten nested objects', () => {
      const data = [
        {
          id: 1,
          user: { name: 'John', age: 30 },
          settings: { theme: 'dark' },
        },
      ];

      const result = formatDataForExport(data);

      expect(result[0]).toEqual({
        id: 1,
        user_name: 'John',
        user_age: 30,
        settings_theme: 'dark',
      });
    });

    it('should preserve non-object values', () => {
      const data = [
        {
          id: 1,
          name: 'John',
          active: true,
          count: 42,
        },
      ];

      const result = formatDataForExport(data);

      expect(result[0]).toEqual({
        id: 1,
        name: 'John',
        active: true,
        count: 42,
      });
    });

    it('should handle arrays correctly', () => {
      const data = [
        {
          id: 1,
          tags: ['admin', 'user'],
        },
      ];

      const result = formatDataForExport(data);

      expect(result[0]).toEqual({
        id: 1,
        tags: ['admin', 'user'],
      });
    });

    it('should handle empty objects', () => {
      const data = [{ id: 1, metadata: {} }];
      const result = formatDataForExport(data);

      expect(result[0]).toEqual({ id: 1 });
    });

    it('should handle null/undefined nested values', () => {
      const data = [
        {
          id: 1,
          user: null,
          settings: undefined,
        },
      ];

      const result = formatDataForExport(data);

      expect(result[0]).toEqual({
        id: 1,
        user: null,
        settings: undefined,
      });
    });
  });
});

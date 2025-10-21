import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getUpcomingAppointments,
  getUnreadMessages,
  getRecentFormulas,
  searchFormulasByTags,
  getLowStockProducts,
  getAppointmentsByDateRange,
} from './optimizedQueries';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('Optimized Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUpcomingAppointments', () => {
    it('should fetch upcoming appointments for stylist', async () => {
      const mockAppointments = [
        { id: '1', stylist_id: 'stylist-123', appointment_date: '2025-10-22' },
        { id: '2', stylist_id: 'stylist-123', appointment_date: '2025-10-23' },
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: mockAppointments, error: null }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockQuery as any);

      const result = await getUpcomingAppointments('stylist-123', 10);

      expect(result).toEqual(mockAppointments);
      expect(supabase.from).toHaveBeenCalledWith('appointments');
    });

    it('should throw error on query failure', async () => {
      const mockError = new Error('Database error');

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockQuery as any);

      await expect(getUpcomingAppointments('stylist-123')).rejects.toThrow('Database error');
    });
  });

  describe('getUnreadMessages', () => {
    it('should fetch unread messages for user', async () => {
      const mockMessages = [
        { id: '1', recipient_id: 'user-123', is_read: false },
        { id: '2', recipient_id: 'user-123', is_read: false },
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockMessages, error: null }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockQuery as any);

      const result = await getUnreadMessages('user-123');

      expect(result).toEqual(mockMessages);
      expect(supabase.from).toHaveBeenCalledWith('messages');
    });
  });

  describe('getRecentFormulas', () => {
    it('should fetch recent formulas for stylist', async () => {
      const mockFormulas = [
        { id: '1', stylist_id: 'stylist-123', formula_name: 'Formula 1' },
        { id: '2', stylist_id: 'stylist-123', formula_name: 'Formula 2' },
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: mockFormulas, error: null }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockQuery as any);

      const result = await getRecentFormulas('stylist-123', 20);

      expect(result).toEqual(mockFormulas);
      expect(supabase.from).toHaveBeenCalledWith('formulas');
    });
  });

  describe('searchFormulasByTags', () => {
    it('should search formulas by tags', async () => {
      const mockFormulas = [
        { id: '1', tags: ['blonde', 'balayage'] },
        { id: '2', tags: ['blonde', 'highlights'] },
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        contains: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockFormulas, error: null }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockQuery as any);

      const result = await searchFormulasByTags('stylist-123', ['blonde']);

      expect(result).toEqual(mockFormulas);
      expect(mockQuery.contains).toHaveBeenCalledWith('tags', ['blonde']);
    });
  });

  describe('getLowStockProducts', () => {
    it('should fetch low stock products', async () => {
      const mockProducts = [
        { id: '1', current_quantity: 2, reorder_threshold: 5 },
        { id: '2', current_quantity: 1, reorder_threshold: 3 },
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockProducts, error: null }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockQuery as any);

      const result = await getLowStockProducts('stylist-123');

      expect(result).toHaveLength(2);
      expect(result[0].current_quantity).toBeLessThanOrEqual(result[0].reorder_threshold);
    });

    it('should filter out products above reorder threshold', async () => {
      const mockProducts = [
        { id: '1', current_quantity: 2, reorder_threshold: 5 },
        { id: '2', current_quantity: 10, reorder_threshold: 3 },
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockProducts, error: null }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockQuery as any);

      const result = await getLowStockProducts('stylist-123');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });
  });

  describe('getAppointmentsByDateRange', () => {
    it('should fetch appointments in date range', async () => {
      const startDate = new Date('2025-10-01');
      const endDate = new Date('2025-10-31');

      const mockAppointments = [
        { id: '1', appointment_date: '2025-10-15' },
        { id: '2', appointment_date: '2025-10-20' },
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockAppointments, error: null }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockQuery as any);

      const result = await getAppointmentsByDateRange('stylist-123', startDate, endDate);

      expect(result).toEqual(mockAppointments);
      expect(mockQuery.gte).toHaveBeenCalled();
      expect(mockQuery.lte).toHaveBeenCalled();
    });
  });
});

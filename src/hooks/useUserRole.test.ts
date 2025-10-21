import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useUserRole } from './useUserRole';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(),
        })),
      })),
    })),
    auth: {
      getUser: vi.fn(),
    },
  },
}));

describe('useUserRole', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return admin role for admin user', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [{ role: 'admin' }],
          error: null,
        }),
      }),
    } as any);

    const { result } = renderHook(() => useUserRole('admin-123'));

    // Wait for state to update
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(result.current.roles).toContain('admin');
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.isStylist).toBe(false);
    expect(result.current.isClient).toBe(false);
  });

  it('should return stylist role for stylist user', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [{ role: 'stylist' }],
          error: null,
        }),
      }),
    } as any);

    const { result } = renderHook(() => useUserRole('stylist-123'));

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(result.current.roles).toContain('stylist');
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isStylist).toBe(true);
    expect(result.current.isClient).toBe(false);
  });

  it('should return client role for client user', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [{ role: 'client' }],
          error: null,
        }),
      }),
    } as any);

    const { result } = renderHook(() => useUserRole('client-123'));

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(result.current.roles).toContain('client');
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isStylist).toBe(false);
    expect(result.current.isClient).toBe(true);
  });

  it('should return empty roles when user is not found', async () => {
    const { result } = renderHook(() => useUserRole());

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(result.current.roles).toEqual([]);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isStylist).toBe(false);
    expect(result.current.isClient).toBe(false);
  });

  it('should handle loading state', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockImplementation(
          () => new Promise(resolve => setTimeout(() => resolve({
            data: [{ role: 'client' }],
            error: null,
          }), 100))
        ),
      }),
    } as any);

    const { result } = renderHook(() => useUserRole('test-123'));

    expect(result.current.loading).toBe(true);

    await new Promise(resolve => setTimeout(resolve, 150));

    expect(result.current.loading).toBe(false);
  });

  it('should handle error fetching role', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: new Error('Database error'),
        }),
      }),
    } as any);

    const { result } = renderHook(() => useUserRole('test-123'));

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(result.current.roles).toEqual([]);
    expect(result.current.loading).toBe(false);
  });
});

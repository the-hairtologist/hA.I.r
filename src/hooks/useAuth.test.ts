import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(),
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
    },
  },
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

describe.skip('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    } as any);

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    } as any);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('should initialize with no user', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
      },
      { timeout: 10000 }
    );

    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should handle successful sign in', async () => {
    const mockUser = { id: '123', email: 'test@example.com' };
    const mockSession = { user: mockUser, access_token: 'token' };

    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: mockUser, session: mockSession },
      error: null,
    } as any);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
      },
      { timeout: 10000 }
    );

    await act(async () => {
      await result.current.signIn('test@example.com', 'password');
      await vi.runAllTimersAsync();
    });

    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    });
  });

  it('should handle sign in error', async () => {
    const error = new Error('Invalid credentials');
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: null, session: null },
      error,
    } as any);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
      },
      { timeout: 10000 }
    );

    await expect(
      act(async () => {
        await result.current.signIn('test@example.com', 'wrong');
        await vi.runAllTimersAsync();
      })
    ).rejects.toThrow();
  });

  it('should handle sign up', async () => {
    const mockUser = { id: '123', email: 'test@example.com' };

    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: { user: mockUser, session: null },
      error: null,
    } as any);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
      },
      { timeout: 10000 }
    );

    await act(async () => {
      await result.current.signUp('test@example.com', 'password', 'Test User');
      await vi.runAllTimersAsync();
    });

    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
      options: expect.objectContaining({
        data: { full_name: 'Test User' },
      }),
    });
  });

  it('should handle sign out', async () => {
    vi.mocked(supabase.auth.signOut).mockResolvedValue({
      error: null,
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
      },
      { timeout: 10000 }
    );

    await act(async () => {
      await result.current.signOut();
      await vi.runAllTimersAsync();
    });

    expect(supabase.auth.signOut).toHaveBeenCalled();
  });

  it('should handle password reset', async () => {
    vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
      data: {},
      error: null,
    } as any);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
      },
      { timeout: 10000 }
    );

    await act(async () => {
      await result.current.resetPassword('test@example.com');
      await vi.runAllTimersAsync();
    });

    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      'test@example.com',
      expect.any(Object)
    );
  });

  it('should handle password update', async () => {
    vi.mocked(supabase.auth.updateUser).mockResolvedValue({
      data: { user: {} },
      error: null,
    } as any);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
      },
      { timeout: 10000 }
    );

    await act(async () => {
      await result.current.updatePassword('newpassword123');
      await vi.runAllTimersAsync();
    });

    expect(supabase.auth.updateUser).toHaveBeenCalledWith({
      password: 'newpassword123',
    });
  });
});

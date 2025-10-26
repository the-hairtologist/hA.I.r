import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('@/integrations/supabase/client', () => {
  const from = vi.fn();
  return {
    supabase: {
      auth: {
        getUser: vi.fn(),
        updateUser: vi.fn(),
        getSession: vi.fn(),
        onAuthStateChange: vi.fn().mockReturnValue({
          data: {
            subscription: {
              unsubscribe: vi.fn(),
            },
          },
        }),
      },
      from,
    },
  };
});

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/hooks/useUserRole', () => ({
  useUserRole: vi.fn(),
}));

vi.mock('@/hooks/useDevMode', () => ({
  useDevMode: vi.fn(),
}));

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import Settings from './Settings';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useDevMode } from '@/hooks/useDevMode';
import { toast } from 'sonner';

type Mock = ReturnType<typeof vi.fn>;

type ToastMock = {
  success: Mock;
  error: Mock;
  warning: Mock;
  info: Mock;
};

const mockedUseAuth = useAuth as unknown as Mock;
const mockedUseUserRole = useUserRole as unknown as Mock;
const mockedUseDevMode = useDevMode as unknown as Mock;
const toastMock = toast as unknown as ToastMock;

const renderSettings = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Settings />
      </QueryClientProvider>
    </BrowserRouter>
  );
};

const waitForSettingsReady = async () => {
  await waitFor(() => {
    expect(screen.getByRole('heading', { name: /settings/i })).toBeInTheDocument();
  });
};

let profileUpdateEqMock: Mock;
let stylistUpdateEqMock: Mock;
let clientUpdateEqMock: Mock;

const updateUserMock = supabase.auth.updateUser as unknown as Mock;

beforeEach(() => {
  vi.clearAllMocks();

  mockedUseAuth.mockReturnValue({
    user: { id: 'test-user', email: 'test@example.com' },
    session: { user: { id: 'test-user', email: 'test@example.com' } },
    loading: false,
    isAuthenticated: true,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    resetPassword: vi.fn(),
    updatePassword: vi.fn(),
  });

  mockedUseUserRole.mockReturnValue({
    roles: ['stylist'],
    loading: false,
  });

  mockedUseDevMode.mockReturnValue({
    isDevMode: false,
    toggleDevMode: vi.fn(),
  });

  toastMock.success.mockClear();
  toastMock.error.mockClear();
  toastMock.warning.mockClear();
  toastMock.info.mockClear();

  (supabase.auth.getSession as Mock).mockResolvedValue({
    data: {
      session: {
        user: {
          id: 'test-user',
          email: 'test@example.com',
        },
      },
    },
    error: null,
  });

  updateUserMock.mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null });

  profileUpdateEqMock = vi.fn().mockResolvedValue({ data: null, error: null });
  stylistUpdateEqMock = vi.fn().mockResolvedValue({ data: null, error: null });
  clientUpdateEqMock = vi.fn().mockResolvedValue({ data: null, error: null });

  (supabase.from as unknown as Mock).mockImplementation((table: string) => {
    if (table === 'profiles') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: {
                full_name: 'Test User',
                avatar_url: '',
                gender: 'female',
              },
              error: null,
            }),
          }),
        }),
        update: vi.fn(() => ({
          eq: profileUpdateEqMock,
        })),
      };
    }

    if (table === 'stylist_profiles') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: {
                business_name: 'Test Studio',
                bio: '',
                specialty: '',
                color_line: '',
                location: '',
                years_experience: 5,
                social_media_instagram: '',
                social_media_tiktok: '',
                social_media_facebook: '',
                business_phone: '',
                business_email: '',
                timezone: 'America/New_York',
                preferred_communication: 'app',
                cancellation_policy: '',
                deposit_required: false,
                deposit_percentage: 0,
                accepts_new_clients: true,
                max_clients_per_day: 8,
                parking_instructions: '',
                special_accommodations: '',
              },
              error: null,
            }),
          }),
        }),
        update: vi.fn(() => ({
          eq: stylistUpdateEqMock,
        })),
      };
    }

    if (table === 'client_profiles') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
        update: vi.fn(() => ({
          eq: clientUpdateEqMock,
        })),
      };
    }

    return {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    };
  });
});

describe('Settings', () => {
  describe('Settings - Profile Form Double Submit Prevention', () => {
    it('should prevent multiple rapid clicks on save button', async () => {
      renderSettings();
      await waitForSettingsReady();

      fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Updated User' } });

      const saveButton = screen.getByRole('button', { name: /save profile/i });

      fireEvent.click(saveButton);
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(profileUpdateEqMock).toHaveBeenCalledTimes(1);
        expect(stylistUpdateEqMock).toHaveBeenCalledTimes(1);
      });
    });

    it('should disable save button during submission', async () => {
      let resolveProfile: ((value: { data: null; error: null }) => void) | undefined;
      profileUpdateEqMock.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveProfile = resolve;
          })
      );

      let resolveStylist: ((value: { data: null; error: null }) => void) | undefined;
      stylistUpdateEqMock.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveStylist = resolve;
          })
      );

      renderSettings();
      await waitForSettingsReady();

      fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Updated User' } });

      const saveButton = screen.getByRole('button', { name: /save profile/i });

      fireEvent.click(saveButton);

      expect(saveButton).toBeDisabled();
      expect(screen.getByText(/saving\.\.\./i)).toBeInTheDocument();

      resolveProfile?.({ data: null, error: null });
      resolveStylist?.({ data: null, error: null });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save profile/i })).not.toBeDisabled();
      });
    });

    it('should show loading indicator during profile save', async () => {
      let resolveProfile: ((value: { data: null; error: null }) => void) | undefined;
      profileUpdateEqMock.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveProfile = resolve;
          })
      );

      renderSettings();
      await waitForSettingsReady();

      fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Updated User' } });

      const saveButton = screen.getByRole('button', { name: /save profile/i });

      fireEvent.click(saveButton);

      expect(screen.getByText(/saving\.\.\./i)).toBeInTheDocument();

      resolveProfile?.({ data: null, error: null });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save profile/i })).not.toBeDisabled();
      });
    });

    it('should re-enable form after successful save', async () => {
      renderSettings();
      await waitForSettingsReady();

      fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Updated User' } });

      const saveButton = screen.getByRole('button', { name: /save profile/i });

      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save profile/i })).not.toBeDisabled();
      });
    });
  });

  describe('Settings - Password Change Double Submit Prevention', () => {
    const fillPasswordFields = () => {
      fireEvent.change(screen.getByLabelText('Current Password'), { target: { value: 'oldPass123' } });
      fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'newPass123' } });
      fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { value: 'newPass123' } });
    };

    it('should prevent multiple rapid password change submissions', async () => {
      renderSettings();
      await waitForSettingsReady();

      fillPasswordFields();

      const passwordButton = screen.getByRole('button', { name: /update password/i });

      fireEvent.click(passwordButton);
      fireEvent.click(passwordButton);

      await waitFor(() => {
        expect(updateUserMock).toHaveBeenCalledTimes(1);
      });
    });

    it('should disable password button during submission', async () => {
      let resolveUpdate: ((value: { data: null; error: null }) => void) | undefined;
      updateUserMock.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveUpdate = resolve;
          })
      );

      renderSettings();
      await waitForSettingsReady();

      fillPasswordFields();

      const passwordButton = screen.getByRole('button', { name: /update password/i });

      fireEvent.click(passwordButton);

      expect(passwordButton).toBeDisabled();
      expect(screen.getByText(/updating password/i)).toBeInTheDocument();

      resolveUpdate?.({ data: null, error: null });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /update password/i })).not.toBeDisabled();
      });
    });

    it('should show loading indicator during password update', async () => {
      let resolveUpdate: ((value: { data: null; error: null }) => void) | undefined;
      updateUserMock.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveUpdate = resolve;
          })
      );

      renderSettings();
      await waitForSettingsReady();

      fillPasswordFields();

      const passwordButton = screen.getByRole('button', { name: /update password/i });

      fireEvent.click(passwordButton);

      expect(screen.getByText(/updating password/i)).toBeInTheDocument();

      resolveUpdate?.({ data: null, error: null });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /update password/i })).not.toBeDisabled();
      });
    });

    it('should re-enable password form after completion', async () => {
      renderSettings();
      await waitForSettingsReady();

      fillPasswordFields();

      const passwordButton = screen.getByRole('button', { name: /update password/i });

      fireEvent.click(passwordButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /update password/i })).not.toBeDisabled();
      });
    });
  });

  describe('Settings - Form Success/Error Handling', () => {
    it('should handle profile save error gracefully', async () => {
      profileUpdateEqMock.mockResolvedValueOnce({ data: null, error: { message: 'Update failed' } });

      renderSettings();
      await waitForSettingsReady();

      fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Updated User' } });

      const saveButton = screen.getByRole('button', { name: /save profile/i });

      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(toastMock.error).toHaveBeenCalledWith('Failed to save profile');
        expect(screen.getByRole('button', { name: /save profile/i })).not.toBeDisabled();
      });
    });

    it('should handle password change error gracefully', async () => {
      updateUserMock.mockResolvedValueOnce({ data: null, error: { message: 'Password update failed' } });

      renderSettings();
      await waitForSettingsReady();

      fireEvent.change(screen.getByLabelText('Current Password'), { target: { value: 'oldPass123' } });
      fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'newPass123' } });
      fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { value: 'newPass123' } });

      const passwordButton = screen.getByRole('button', { name: /update password/i });

      fireEvent.click(passwordButton);

      await waitFor(() => {
        expect(toastMock.error).toHaveBeenCalledWith('Failed to change password');
        expect(screen.getByRole('button', { name: /update password/i })).not.toBeDisabled();
      });
    });
  });
});

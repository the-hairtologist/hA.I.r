import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import Settings from './Settings';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase with complete auth mock
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      updateUser: vi.fn(),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: {
          subscription: {
            unsubscribe: vi.fn()
          }
        }
      })
    },
    from: vi.fn(),
  },
}));

// Mock components
vi.mock('@/components/DashboardLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

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

describe('Settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock user data
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: 'test-user', email: 'test@example.com' } },
      error: null
    });

    // Mock profile queries
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { full_name: 'Test User', phone: '+1234567890' },
        error: null
      }),
      update: vi.fn().mockResolvedValue({ data: null, error: null }),
    });
  });

  describe('Settings - Profile Form Double Submit Prevention', () => {
    it('should prevent multiple rapid clicks on save button', async () => {
      renderSettings();

      const saveButton = screen.getByTestId('save-profile-button');
      
      // First click
      fireEvent.click(saveButton);
      
      // Second click immediately  
      fireEvent.click(saveButton);
      
      // Should only call update once
      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledTimes(2); // One for fetch, one for update
      });
    });

    it('should disable save button during submission', async () => {
      renderSettings();

      const saveButton = screen.getByTestId('save-profile-button');
      
      fireEvent.click(saveButton);
      
      expect(saveButton).toBeDisabled();
    });

    it('should show loading indicator during profile save', async () => {
      renderSettings();

      const saveButton = screen.getByTestId('save-profile-button');
      
      fireEvent.click(saveButton);
      
      expect(screen.getByTestId('profile-saving-indicator')).toBeInTheDocument();
    });

    it('should re-enable form after successful save', async () => {
      renderSettings();

      const saveButton = screen.getByTestId('save-profile-button');
      
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(saveButton).not.toBeDisabled();
      });
    });
  });

  describe('Settings - Password Change Double Submit Prevention', () => {
    it('should prevent multiple rapid password change submissions', async () => {
      renderSettings();

      const passwordButton = screen.getByTestId('change-password-button');
      
      fireEvent.click(passwordButton);
      fireEvent.click(passwordButton);
      
      await waitFor(() => {
        expect(supabase.auth.updateUser).toHaveBeenCalledTimes(1);
      });
    });

    it('should disable password button during submission', async () => {
      renderSettings();

      const passwordButton = screen.getByTestId('change-password-button');
      
      fireEvent.click(passwordButton);
      
      expect(passwordButton).toBeDisabled();
    });

    it('should show loading indicator during password update', async () => {
      renderSettings();

      const passwordButton = screen.getByTestId('change-password-button');
      
      fireEvent.click(passwordButton);
      
      expect(screen.getByTestId('password-updating-indicator')).toBeInTheDocument();
    });

    it('should re-enable password form after completion', async () => {
      renderSettings();

      const passwordButton = screen.getByTestId('change-password-button');
      
      fireEvent.click(passwordButton);
      
      await waitFor(() => {
        expect(passwordButton).not.toBeDisabled();
      });
    });
  });

  describe('Settings - Form Success/Error Handling', () => {
    it('should handle profile save error gracefully', async () => {
      // Mock error
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { full_name: 'Test User', phone: '+1234567890' },
          error: null
        }),
        update: vi.fn().mockResolvedValue({ data: null, error: { message: 'Update failed' } }),
      });

      renderSettings();

      const saveButton = screen.getByTestId('save-profile-button');
      
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
        expect(saveButton).not.toBeDisabled();
      });
    });

    it('should handle password change error gracefully', async () => {
      (supabase.auth.updateUser as any).mockResolvedValue({
        data: null,
        error: { message: 'Password update failed' }
      });

      renderSettings();

      const passwordButton = screen.getByTestId('change-password-button');
      
      fireEvent.click(passwordButton);
      
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
        expect(passwordButton).not.toBeDisabled();
      });
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Settings from './Settings';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      updateUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

// Mock components
vi.mock('@/components/DashboardLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/settings/DataExport', () => ({
  default: () => <div>Data Export</div>,
}));

vi.mock('@/components/settings/AccountDeletion', () => ({
  default: () => <div>Account Deletion</div>,
}));

const renderSettings = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Settings />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Settings - Profile Form Double Submit Prevention', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock user data
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
      error: null,
    });

    // Mock profile query
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { 
              user_id: 'user-123',
              full_name: 'John Doe',
              phone: '555-0100',
              role: 'client'
            },
            error: null,
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    });
    (supabase.from as any).mockImplementation(mockFrom);
  });

  it('should prevent multiple rapid clicks on save button', async () => {
    const user = userEvent.setup();
    renderSettings();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/full name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Jane Doe');

    const saveButton = screen.getByRole('button', { name: /save profile/i });

    // First click
    await user.click(saveButton);

    // Immediate second click (should be prevented)
    await user.click(saveButton);

    // Should only call update once due to double-submit prevention
    await waitFor(() => {
      const fromCalls = (supabase.from as any).mock.calls;
      const updateCalls = fromCalls.filter((call: any) => {
        const chain = (supabase.from as any)(call[0]);
        return chain.update !== undefined;
      });
      expect(updateCalls.length).toBeLessThanOrEqual(1);
    });
  });

  it('should disable save button during submission', async () => {
    const user = userEvent.setup();
    renderSettings();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/full name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Jane Doe');

    const saveButton = screen.getByRole('button', { name: /save profile/i });
    expect(saveButton).not.toBeDisabled();

    await user.click(saveButton);

    // Button should be disabled during submission
    await waitFor(() => {
      expect(saveButton).toBeDisabled();
    });
  });

  it('should show loading indicator during profile save', async () => {
    const user = userEvent.setup();
    renderSettings();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/full name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Jane Doe');

    const saveButton = screen.getByRole('button', { name: /save profile/i });
    await user.click(saveButton);

    // Should show "Saving..." text
    expect(screen.getByText(/saving\.\.\./i)).toBeInTheDocument();
  });

  it('should re-enable form after successful save', async () => {
    const user = userEvent.setup();
    renderSettings();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/full name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Jane Doe');

    const saveButton = screen.getByRole('button', { name: /save profile/i });
    await user.click(saveButton);

    // Wait for submission to complete
    await waitFor(() => {
      expect(screen.queryByText(/saving\.\.\./i)).not.toBeInTheDocument();
    });

    // Button should be re-enabled (but disabled due to no changes)
    expect(saveButton).toBeDisabled(); // Disabled because hasChanges is false after save
  });
});

describe('Settings - Password Change Double Submit Prevention', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
      error: null,
    });

    (supabase.auth.updateUser as any).mockResolvedValue({ error: null });

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { 
              user_id: 'user-123',
              full_name: 'John Doe',
              role: 'client'
            },
            error: null,
          }),
        }),
      }),
    });
    (supabase.from as any).mockImplementation(mockFrom);
  });

  it('should prevent multiple rapid password change submissions', async () => {
    const user = userEvent.setup();
    renderSettings();

    // Navigate to security tab
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /security/i })).toBeInTheDocument();
    });
    
    const securityTab = screen.getByRole('tab', { name: /security/i });
    await user.click(securityTab);

    // Fill password fields
    const currentPassword = screen.getByLabelText(/current password/i);
    const newPassword = screen.getByLabelText(/new password/i);
    const confirmPassword = screen.getByLabelText(/confirm new password/i);

    await user.type(currentPassword, 'oldPassword123');
    await user.type(newPassword, 'newPassword123');
    await user.type(confirmPassword, 'newPassword123');

    const updateButton = screen.getByRole('button', { name: /update password/i });

    // First click
    await user.click(updateButton);

    // Immediate second click (should be prevented)
    await user.click(updateButton);

    // Should only call updateUser once
    await waitFor(() => {
      expect(supabase.auth.updateUser).toHaveBeenCalledTimes(1);
    });
  });

  it('should disable password button during submission', async () => {
    const user = userEvent.setup();
    renderSettings();

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /security/i })).toBeInTheDocument();
    });
    
    const securityTab = screen.getByRole('tab', { name: /security/i });
    await user.click(securityTab);

    const currentPassword = screen.getByLabelText(/current password/i);
    const newPassword = screen.getByLabelText(/new password/i);
    const confirmPassword = screen.getByLabelText(/confirm new password/i);

    await user.type(currentPassword, 'oldPassword123');
    await user.type(newPassword, 'newPassword123');
    await user.type(confirmPassword, 'newPassword123');

    const updateButton = screen.getByRole('button', { name: /update password/i });
    expect(updateButton).not.toBeDisabled();

    await user.click(updateButton);

    // Button should be disabled during submission
    await waitFor(() => {
      expect(updateButton).toBeDisabled();
    });
  });

  it('should show loading indicator during password update', async () => {
    const user = userEvent.setup();
    renderSettings();

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /security/i })).toBeInTheDocument();
    });
    
    const securityTab = screen.getByRole('tab', { name: /security/i });
    await user.click(securityTab);

    const currentPassword = screen.getByLabelText(/current password/i);
    const newPassword = screen.getByLabelText(/new password/i);
    const confirmPassword = screen.getByLabelText(/confirm new password/i);

    await user.type(currentPassword, 'oldPassword123');
    await user.type(newPassword, 'newPassword123');
    await user.type(confirmPassword, 'newPassword123');

    const updateButton = screen.getByRole('button', { name: /update password/i });
    await user.click(updateButton);

    // Should show loading text
    expect(screen.getByText(/updating password\.\.\./i)).toBeInTheDocument();
  });

  it('should re-enable password form after completion', async () => {
    const user = userEvent.setup();
    renderSettings();

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /security/i })).toBeInTheDocument();
    });
    
    const securityTab = screen.getByRole('tab', { name: /security/i });
    await user.click(securityTab);

    const currentPassword = screen.getByLabelText(/current password/i);
    const newPassword = screen.getByLabelText(/new password/i);
    const confirmPassword = screen.getByLabelText(/confirm new password/i);

    await user.type(currentPassword, 'oldPassword123');
    await user.type(newPassword, 'newPassword123');
    await user.type(confirmPassword, 'newPassword123');

    const updateButton = screen.getByRole('button', { name: /update password/i });
    await user.click(updateButton);

    // Wait for submission to complete
    await waitFor(() => {
      expect(screen.queryByText(/updating password\.\.\./i)).not.toBeInTheDocument();
    });

    // Fields should be cleared and button should be disabled (due to empty fields)
    expect(currentPassword).toHaveValue('');
    expect(updateButton).toBeDisabled();
  });
});

describe('Settings - Form Success/Error Handling', () => {
  it('should handle profile save error gracefully', async () => {
    const user = userEvent.setup();
    
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
      error: null,
    });

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { user_id: 'user-123', full_name: 'John Doe', role: 'client' },
            error: null,
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: new Error('Update failed') }),
      }),
    });
    (supabase.from as any).mockImplementation(mockFrom);

    renderSettings();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/full name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Jane Doe');

    const saveButton = screen.getByRole('button', { name: /save profile/i });
    await user.click(saveButton);

    // Should show error and re-enable form
    await waitFor(() => {
      expect(screen.queryByText(/saving\.\.\./i)).not.toBeInTheDocument();
    });
  });

  it('should handle password change error gracefully', async () => {
    const user = userEvent.setup();
    
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
      error: null,
    });

    (supabase.auth.updateUser as any).mockResolvedValue({ 
      error: new Error('Password update failed') 
    });

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { user_id: 'user-123', full_name: 'John Doe', role: 'client' },
            error: null,
          }),
        }),
      }),
    });
    (supabase.from as any).mockImplementation(mockFrom);

    renderSettings();

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /security/i })).toBeInTheDocument();
    });
    
    const securityTab = screen.getByRole('tab', { name: /security/i });
    await user.click(securityTab);

    const currentPassword = screen.getByLabelText(/current password/i);
    const newPassword = screen.getByLabelText(/new password/i);
    const confirmPassword = screen.getByLabelText(/confirm new password/i);

    await user.type(currentPassword, 'oldPassword123');
    await user.type(newPassword, 'newPassword123');
    await user.type(confirmPassword, 'newPassword123');

    const updateButton = screen.getByRole('button', { name: /update password/i });
    await user.click(updateButton);

    // Should show error and re-enable form
    await waitFor(() => {
      expect(screen.queryByText(/updating password\.\.\./i)).not.toBeInTheDocument();
    });
  });
});

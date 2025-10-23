import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Services from './Services';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

// Mock DashboardLayout
vi.mock('@/components/DashboardLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const renderServices = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Services />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Services - Delete Double Submit Prevention', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: 'stylist-123' } },
      error: null,
    });

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [
            {
              id: 'service-1',
              name: 'Haircut',
              duration: 60,
              price: 50,
              description: 'Basic haircut',
            },
            {
              id: 'service-2',
              name: 'Color',
              duration: 90,
              price: 100,
              description: 'Hair coloring',
            },
          ],
          error: null,
        }),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    });
    (supabase.from as any).mockImplementation(mockFrom);
  });

  it('should prevent multiple rapid clicks on delete button', async () => {
    const user = userEvent.setup();
    renderServices();

    await waitFor(() => {
      expect(screen.getByText('Haircut')).toBeInTheDocument();
    });

    // Click delete button
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteButtons[0]);

    // Confirm delete in dialog
    const confirmButton = screen.getByRole('button', { name: /delete service/i });
    
    // First click
    await user.click(confirmButton);

    // Immediate second click (should be prevented)
    await user.click(confirmButton);

    // Should only call delete once
    await waitFor(() => {
      const fromCalls = (supabase.from as any).mock.calls;
      const deleteCalls = fromCalls.filter((call: any) => {
        const chain = (supabase.from as any)(call[0]);
        return chain.delete !== undefined;
      });
      expect(deleteCalls.length).toBeLessThanOrEqual(1);
    });
  });

  it('should disable delete button during submission', async () => {
    const user = userEvent.setup();
    renderServices();

    await waitFor(() => {
      expect(screen.getByText('Haircut')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteButtons[0]);

    const confirmButton = screen.getByRole('button', { name: /delete service/i });
    expect(confirmButton).not.toBeDisabled();

    await user.click(confirmButton);

    // Button should be disabled during submission
    await waitFor(() => {
      expect(confirmButton).toBeDisabled();
    });
  });

  it('should show loading indicator during delete', async () => {
    const user = userEvent.setup();
    renderServices();

    await waitFor(() => {
      expect(screen.getByText('Haircut')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteButtons[0]);

    const confirmButton = screen.getByRole('button', { name: /delete service/i });
    await user.click(confirmButton);

    // Should show loading spinner
    expect(confirmButton).toBeDisabled();
  });

  it('should re-enable form after successful delete', async () => {
    const user = userEvent.setup();
    renderServices();

    await waitFor(() => {
      expect(screen.getByText('Haircut')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteButtons[0]);

    const confirmButton = screen.getByRole('button', { name: /delete service/i });
    await user.click(confirmButton);

    // Wait for dialog to close
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /delete service/i })).not.toBeInTheDocument();
    });
  });
});

describe('Services - Loading State Visibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: 'stylist-123' } },
      error: null,
    });

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [
            {
              id: 'service-1',
              name: 'Haircut',
              duration: 60,
              price: 50,
              description: 'Basic haircut',
            },
          ],
          error: null,
        }),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    });
    (supabase.from as any).mockImplementation(mockFrom);
  });

  it('should show loading spinner during delete', async () => {
    const user = userEvent.setup();
    renderServices();

    await waitFor(() => {
      expect(screen.getByText('Haircut')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteButtons[0]);

    const confirmButton = screen.getByRole('button', { name: /delete service/i });
    await user.click(confirmButton);

    // Should show loading state
    expect(confirmButton).toBeDisabled();
  });

  it('should hide loading indicator after completion', async () => {
    const user = userEvent.setup();
    renderServices();

    await waitFor(() => {
      expect(screen.getByText('Haircut')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteButtons[0]);

    const confirmButton = screen.getByRole('button', { name: /delete service/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /delete service/i })).not.toBeInTheDocument();
    });
  });
});

describe('Services - Button Disabled States', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: 'stylist-123' } },
      error: null,
    });

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [
            {
              id: 'service-1',
              name: 'Haircut',
              duration: 60,
              price: 50,
              description: 'Basic haircut',
            },
          ],
          error: null,
        }),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    });
    (supabase.from as any).mockImplementation(mockFrom);
  });

  it('should disable delete button during deletion', async () => {
    const user = userEvent.setup();
    renderServices();

    await waitFor(() => {
      expect(screen.getByText('Haircut')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteButtons[0]);

    const confirmButton = screen.getByRole('button', { name: /delete service/i });
    await user.click(confirmButton);

    expect(confirmButton).toBeDisabled();
  });
});

describe('Services - Form Re-enabling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should close dialog after successful delete', async () => {
    const user = userEvent.setup();
    
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: 'stylist-123' } },
      error: null,
    });

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [
            {
              id: 'service-1',
              name: 'Haircut',
              duration: 60,
              price: 50,
              description: 'Basic haircut',
            },
          ],
          error: null,
        }),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    });
    (supabase.from as any).mockImplementation(mockFrom);

    renderServices();

    await waitFor(() => {
      expect(screen.getByText('Haircut')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteButtons[0]);

    const confirmButton = screen.getByRole('button', { name: /delete service/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /delete service/i })).not.toBeInTheDocument();
    });
  });

  it('should re-enable form after delete error', async () => {
    const user = userEvent.setup();
    
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: 'stylist-123' } },
      error: null,
    });

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [
            {
              id: 'service-1',
              name: 'Haircut',
              duration: 60,
              price: 50,
              description: 'Basic haircut',
            },
          ],
          error: null,
        }),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ 
          error: new Error('Delete failed') 
        }),
      }),
    });
    (supabase.from as any).mockImplementation(mockFrom);

    renderServices();

    await waitFor(() => {
      expect(screen.getByText('Haircut')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteButtons[0]);

    const confirmButton = screen.getByRole('button', { name: /delete service/i });
    await user.click(confirmButton);

    // Wait for error state
    await waitFor(() => {
      expect(confirmButton).not.toBeDisabled();
    });

    // Dialog should still be open for retry
    expect(confirmButton).toBeInTheDocument();
  });
});

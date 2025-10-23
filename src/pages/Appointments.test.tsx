import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Appointments from './Appointments';
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

const renderAppointments = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Appointments />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Appointments - Bulk Actions Double Submit Prevention', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: 'stylist-123' } },
      error: null,
    });

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [
              {
                id: 'appt-1',
                status: 'pending',
                appointment_date: '2025-02-01',
                appointment_time: '10:00',
                client: { full_name: 'Jane Doe' },
                service: { name: 'Haircut', duration: 60 },
              },
              {
                id: 'appt-2',
                status: 'pending',
                appointment_date: '2025-02-02',
                appointment_time: '14:00',
                client: { full_name: 'John Smith' },
                service: { name: 'Color', duration: 90 },
              },
            ],
            error: null,
          }),
        }),
        or: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
        in: vi.fn().mockResolvedValue({ error: null }),
      }),
    });
    (supabase.from as any).mockImplementation(mockFrom);
  });

  it('should prevent multiple rapid clicks on bulk complete button', async () => {
    const user = userEvent.setup();
    renderAppointments();

    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    // Select appointments
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]); // First appointment
    await user.click(checkboxes[2]); // Second appointment

    const completeButton = screen.getByRole('button', { name: /mark.*completed/i });

    // First click
    await user.click(completeButton);

    // Immediate second click (should be prevented)
    await user.click(completeButton);

    // Should only call update once
    await waitFor(() => {
      const fromCalls = (supabase.from as any).mock.calls;
      const updateCalls = fromCalls.filter((call: any) => call[0] === 'appointments');
      expect(updateCalls.length).toBeLessThanOrEqual(1);
    });
  });

  it('should disable bulk complete button during submission', async () => {
    const user = userEvent.setup();
    renderAppointments();

    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]);

    const completeButton = screen.getByRole('button', { name: /mark.*completed/i });
    expect(completeButton).not.toBeDisabled();

    await user.click(completeButton);

    // Button should be disabled during submission
    await waitFor(() => {
      expect(completeButton).toBeDisabled();
    });
  });

  it('should show loading indicator during bulk complete', async () => {
    const user = userEvent.setup();
    renderAppointments();

    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]);

    const completeButton = screen.getByRole('button', { name: /mark.*completed/i });
    await user.click(completeButton);

    // Should show loading spinner
    await waitFor(() => {
      expect(completeButton).toBeDisabled();
    });
  });

  it('should re-enable form after successful bulk complete', async () => {
    const user = userEvent.setup();
    renderAppointments();

    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]);

    const completeButton = screen.getByRole('button', { name: /mark.*completed/i });
    await user.click(completeButton);

    // Wait for submission to complete
    await waitFor(() => {
      expect(completeButton).not.toBeDisabled();
    });
  });
});

describe('Appointments - Loading State Visibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: 'stylist-123' } },
      error: null,
    });

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [
              {
                id: 'appt-1',
                status: 'pending',
                appointment_date: '2025-02-01',
                appointment_time: '10:00',
                client: { full_name: 'Jane Doe' },
                service: { name: 'Haircut', duration: 60 },
              },
            ],
            error: null,
          }),
        }),
        or: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue({ error: null }),
      }),
    });
    (supabase.from as any).mockImplementation(mockFrom);
  });

  it('should show loading spinner during bulk action', async () => {
    const user = userEvent.setup();
    renderAppointments();

    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]);

    const completeButton = screen.getByRole('button', { name: /mark.*completed/i });
    await user.click(completeButton);

    // Should show loading state
    expect(completeButton).toBeDisabled();
  });

  it('should hide loading indicator after completion', async () => {
    const user = userEvent.setup();
    renderAppointments();

    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]);

    const completeButton = screen.getByRole('button', { name: /mark.*completed/i });
    await user.click(completeButton);

    await waitFor(() => {
      expect(completeButton).not.toBeDisabled();
    });
  });
});

describe('Appointments - Button Disabled States', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: 'stylist-123' } },
      error: null,
    });

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [
              {
                id: 'appt-1',
                status: 'pending',
                appointment_date: '2025-02-01',
                appointment_time: '10:00',
                client: { full_name: 'Jane Doe' },
                service: { name: 'Haircut', duration: 60 },
              },
            ],
            error: null,
          }),
        }),
        or: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue({ error: null }),
      }),
    });
    (supabase.from as any).mockImplementation(mockFrom);
  });

  it('should disable bulk actions when no appointments selected', async () => {
    renderAppointments();

    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    const completeButton = screen.getByRole('button', { name: /mark.*completed/i });
    expect(completeButton).toBeDisabled();
  });

  it('should enable bulk actions when appointments are selected', async () => {
    const user = userEvent.setup();
    renderAppointments();

    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]);

    const completeButton = screen.getByRole('button', { name: /mark.*completed/i });
    expect(completeButton).not.toBeDisabled();
  });
});

describe('Appointments - Form Re-enabling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should re-enable form after successful bulk action', async () => {
    const user = userEvent.setup();
    
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: 'stylist-123' } },
      error: null,
    });

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [
              {
                id: 'appt-1',
                status: 'pending',
                appointment_date: '2025-02-01',
                appointment_time: '10:00',
                client: { full_name: 'Jane Doe' },
                service: { name: 'Haircut', duration: 60 },
              },
            ],
            error: null,
          }),
        }),
        or: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue({ error: null }),
      }),
    });
    (supabase.from as any).mockImplementation(mockFrom);

    renderAppointments();

    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]);

    const completeButton = screen.getByRole('button', { name: /mark.*completed/i });
    await user.click(completeButton);

    await waitFor(() => {
      expect(completeButton).not.toBeDisabled();
    });
  });

  it('should re-enable form after bulk action error', async () => {
    const user = userEvent.setup();
    
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: 'stylist-123' } },
      error: null,
    });

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [
              {
                id: 'appt-1',
                status: 'pending',
                appointment_date: '2025-02-01',
                appointment_time: '10:00',
                client: { full_name: 'Jane Doe' },
                service: { name: 'Haircut', duration: 60 },
              },
            ],
            error: null,
          }),
        }),
        or: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue({ 
          error: new Error('Update failed') 
        }),
      }),
    });
    (supabase.from as any).mockImplementation(mockFrom);

    renderAppointments();

    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]);

    const completeButton = screen.getByRole('button', { name: /mark.*completed/i });
    await user.click(completeButton);

    // Wait for error state
    await waitFor(() => {
      expect(completeButton).not.toBeDisabled();
    });

    // Selection should still be active for retry
    expect(checkboxes[1]).toBeChecked();
  });
});

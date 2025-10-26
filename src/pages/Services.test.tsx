import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import Services from './Services';
import { supabase } from '@/integrations/supabase/client';
import { getServicesByStylist } from '@/lib/queries/serviceQueries';

type Mock = ReturnType<typeof vi.fn>;

const mockStylistProfile = {
  id: 'stylist-123',
  user_id: 'user-123',
};

const mockService = {
  id: '1',
  service_name: 'Haircut',
  description: 'Professional haircut',
  duration_minutes: 60,
  price: 50,
  is_active: true,
  require_deposit: false,
  deposit_amount: 0,
  deposit_type: 'fixed',
  buffer_time_minutes: null,
};

const confirmMock = vi.fn();
vi.stubGlobal('confirm', confirmMock);

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn().mockResolvedValue({
        data: {
          session: {
            user: {
              id: 'user-123',
              email: 'stylist@example.com',
            },
          },
        },
        error: null,
      }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      }),
    },
    from: vi.fn(),
  },
}));

vi.mock('@/lib/queries/serviceQueries', () => ({
  getServicesByStylist: vi.fn(),
}));

const mockedGetServicesByStylist = getServicesByStylist as unknown as Mock;

const renderServices = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Services />
      </QueryClientProvider>
    </BrowserRouter>
  );
};

let insertMock: Mock;
let updateEqMock: Mock;
let deleteEqMock: Mock;

beforeEach(() => {
  vi.clearAllMocks();

  confirmMock.mockClear();
  confirmMock.mockReturnValue(true);

  mockedGetServicesByStylist.mockReset();
  mockedGetServicesByStylist.mockResolvedValue([mockService]);

  insertMock = vi.fn().mockResolvedValue({ data: null, error: null });
  updateEqMock = vi.fn().mockResolvedValue({ data: null, error: null });
  deleteEqMock = vi.fn().mockResolvedValue({ error: null });

  (supabase.from as unknown as Mock).mockImplementation((table: string) => {
    if (table === 'stylist_profiles') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: mockStylistProfile,
              error: null,
            }),
          }),
        }),
      };
    }

    if (table === 'stylist_services') {
      return {
        insert: insertMock,
        update: vi.fn(() => ({
          eq: updateEqMock,
        })),
        delete: vi.fn(() => ({
          eq: deleteEqMock,
        })),
      };
    }

    return {};
  });
});

describe('Services', () => {
  const waitForServiceList = async () => {
    await waitFor(() => {
      expect(screen.getByText('Haircut')).toBeInTheDocument();
    });
  };

  describe('Services - Delete Double Submit Prevention', () => {
    it('should prevent multiple rapid clicks on delete button', async () => {
      renderServices();

      await waitForServiceList();

      const deleteButton = screen.getByRole('button', { name: /delete service/i });

      fireEvent.click(deleteButton);
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(deleteEqMock).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Services - Loading State Visibility', () => {
    it('should show loading spinner during delete', async () => {
      let resolveDelete: ((value: { error: any }) => void) | undefined;
      deleteEqMock.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveDelete = resolve;
          })
      );

      renderServices();
      await waitForServiceList();

      const deleteButton = screen.getByRole('button', { name: /delete service/i });

      fireEvent.click(deleteButton);

      expect(deleteButton).toBeDisabled();
      expect(deleteButton.querySelector('.animate-spin')).toBeTruthy();

      resolveDelete?.({ error: null });

      await waitFor(() => {
        const refreshedButton = screen.getByRole('button', { name: /delete service/i });
        expect(refreshedButton.querySelector('.animate-spin')).toBeNull();
      });
    });

    it('should hide loading spinner after completion', async () => {
      renderServices();
      await waitForServiceList();

      const deleteButton = screen.getByRole('button', { name: /delete service/i });

      fireEvent.click(deleteButton);

      await waitFor(() => {
        const refreshedButton = screen.getByRole('button', { name: /delete service/i });
        expect(refreshedButton.querySelector('.animate-spin')).toBeNull();
      });
    });
  });

  describe('Services - Button Disabled States', () => {
    it('should disable delete button while submission is in progress', async () => {
      let resolveDelete: ((value: { error: any }) => void) | undefined;
      deleteEqMock.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveDelete = resolve;
          })
      );

      renderServices();
      await waitForServiceList();

      const deleteButton = screen.getByRole('button', { name: /delete service/i });

      fireEvent.click(deleteButton);

      expect(deleteButton).toBeDisabled();

      resolveDelete?.({ error: null });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /delete service/i })).not.toBeDisabled();
      });
    });
  });

  describe('Services - Form Re-enabling', () => {
    it('should reset deleting state after successful delete', async () => {
      renderServices();
      await waitForServiceList();

      const deleteButton = screen.getByRole('button', { name: /delete service/i });

      fireEvent.click(deleteButton);

      await waitFor(() => {
        const refreshedButton = screen.getByRole('button', { name: /delete service/i });
        expect(refreshedButton).not.toBeDisabled();
      });
    });

    it('should re-enable form after delete error', async () => {
      deleteEqMock.mockResolvedValueOnce({ error: { message: 'Delete failed' } });

      renderServices();
      await waitForServiceList();

      const deleteButton = screen.getByRole('button', { name: /delete service/i });

      fireEvent.click(deleteButton);

      await waitFor(() => {
        const refreshedButton = screen.getByRole('button', { name: /delete service/i });
        expect(refreshedButton).not.toBeDisabled();
      });
    });
  });
});

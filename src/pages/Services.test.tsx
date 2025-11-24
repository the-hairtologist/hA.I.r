import { renderWithProviders, screen, fireEvent, waitFor } from '@/lib/testing/testUtils';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import Services from './Services';
import { supabase } from '@/integrations/supabase/client';
import { getServicesByStylist } from '@/lib/queries/serviceQueries';

type Mock = ReturnType<typeof vi.fn>;

type SupabaseMutationResult = { error: { message: string } | null };

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

  return renderWithProviders(<Services />, { queryClient });
};

let insertMock: Mock;
let updateEqMock: Mock;
let deleteEqMock: Mock;
let serviceTypeSelectMock: Mock;
let serviceTypeSelectEqMock: Mock;
let serviceTypeSelectOrderMock: Mock;
let serviceTypeUpdateMock: Mock;
let serviceTypeUpdateEqMock: Mock;
let serviceTypeInsertMock: Mock;
let serviceTypeInsertSelectMock: Mock;
let serviceTypeInsertMaybeSingleMock: Mock;
let serviceTypeDeleteMock: Mock;
let serviceTypeDeleteEqMock: Mock;

beforeEach(() => {
  vi.clearAllMocks();

  confirmMock.mockClear();
  confirmMock.mockReturnValue(true);

  mockedGetServicesByStylist.mockReset();
  mockedGetServicesByStylist.mockResolvedValue([mockService]);

  insertMock = vi.fn().mockResolvedValue({ data: null, error: null });
  updateEqMock = vi.fn().mockResolvedValue({ data: null, error: null });
  deleteEqMock = vi.fn().mockResolvedValue({ error: null });
  serviceTypeSelectOrderMock = vi
    .fn()
    .mockResolvedValue({ data: [], error: null });
  serviceTypeSelectEqMock = vi.fn().mockReturnValue({
    order: serviceTypeSelectOrderMock,
  });
  serviceTypeSelectMock = vi.fn().mockReturnValue({
    eq: serviceTypeSelectEqMock,
  });
  serviceTypeUpdateEqMock = vi.fn().mockResolvedValue({ error: null });
  serviceTypeUpdateMock = vi.fn(() => ({
    eq: serviceTypeUpdateEqMock,
  }));
  serviceTypeInsertMaybeSingleMock = vi.fn().mockResolvedValue({
    data: {
      id: 'color-1',
      stylist_id: mockStylistProfile.id,
      service_type: 'Color',
      color: 'hsl(270 85% 60%)',
    },
    error: null,
  });
  serviceTypeInsertSelectMock = vi.fn(() => ({
    maybeSingle: serviceTypeInsertMaybeSingleMock,
  }));
  serviceTypeInsertMock = vi.fn(() => ({
    select: serviceTypeInsertSelectMock,
  }));
  serviceTypeDeleteEqMock = vi.fn().mockResolvedValue({ error: null });
  serviceTypeDeleteMock = vi.fn(() => ({
    eq: serviceTypeDeleteEqMock,
  }));

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

    if (table === 'service_type_colors') {
      return {
        select: serviceTypeSelectMock,
        update: serviceTypeUpdateMock,
        insert: serviceTypeInsertMock,
        delete: serviceTypeDeleteMock,
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

      const deleteButton = screen.getByRole('button', {
        name: /delete service/i,
      });

      fireEvent.click(deleteButton);
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(deleteEqMock).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Services - Loading State Visibility', () => {
    it('should show loading spinner during delete', async () => {
      let resolveDelete: ((value: SupabaseMutationResult) => void) | undefined;
      deleteEqMock.mockImplementationOnce(
        () =>
          new Promise<SupabaseMutationResult>(resolve => {
            resolveDelete = resolve;
          })
      );

      renderServices();
      await waitForServiceList();

      const deleteButton = screen.getByRole('button', {
        name: /delete service/i,
      });

      fireEvent.click(deleteButton);

      expect(deleteButton).toBeDisabled();
      expect(deleteButton.querySelector('.animate-spin')).toBeTruthy();

      resolveDelete?.({ error: null });

      await waitFor(() => {
        const refreshedButton = screen.getByRole('button', {
          name: /delete service/i,
        });
        expect(refreshedButton.querySelector('.animate-spin')).toBeNull();
      });
    });

    it('should hide loading spinner after completion', async () => {
      renderServices();
      await waitForServiceList();

      const deleteButton = screen.getByRole('button', {
        name: /delete service/i,
      });

      fireEvent.click(deleteButton);

      await waitFor(() => {
        const refreshedButton = screen.getByRole('button', {
          name: /delete service/i,
        });
        expect(refreshedButton.querySelector('.animate-spin')).toBeNull();
      });
    });
  });

  describe('Services - Button Disabled States', () => {
    it('should disable delete button while submission is in progress', async () => {
      let resolveDelete: ((value: SupabaseMutationResult) => void) | undefined;
      deleteEqMock.mockImplementationOnce(
        () =>
          new Promise<SupabaseMutationResult>(resolve => {
            resolveDelete = resolve;
          })
      );

      renderServices();
      await waitForServiceList();

      const deleteButton = screen.getByRole('button', {
        name: /delete service/i,
      });

      fireEvent.click(deleteButton);

      expect(deleteButton).toBeDisabled();

      resolveDelete?.({ error: null });

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /delete service/i })
        ).not.toBeDisabled();
      });
    });
  });

  describe('Services - Form Re-enabling', () => {
    it('should reset deleting state after successful delete', async () => {
      renderServices();
      await waitForServiceList();

      const deleteButton = screen.getByRole('button', {
        name: /delete service/i,
      });

      fireEvent.click(deleteButton);

      await waitFor(
        () => {
          const refreshedButton = screen.getByRole('button', {
            name: /delete service/i,
          });
          expect(refreshedButton).not.toBeDisabled();
        },
        { timeout: 2000 }
      );
    });

    it('should re-enable form after delete error', async () => {
      deleteEqMock.mockResolvedValueOnce({
        error: { message: 'Delete failed' },
      });

      renderServices();
      await waitForServiceList();

      const deleteButton = screen.getByRole('button', {
        name: /delete service/i,
      });

      fireEvent.click(deleteButton);

      await waitFor(
        () => {
          const refreshedButton = screen.getByRole('button', {
            name: /delete service/i,
          });
          expect(refreshedButton).not.toBeDisabled();
        },
        { timeout: 2000 }
      );
    });
  });
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import Services from './Services';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase with complete auth mock
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
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
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Services />
      </QueryClientProvider>
    </BrowserRouter>
  );
};

describe('Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful service queries
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
          {
            id: '1',
            name: 'Haircut',
            description: 'Professional haircut',
            duration: 60,
            price: 50,
            category: 'Hair'
          }
        ],
        error: null
      }),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      update: vi.fn().mockResolvedValue({ data: null, error: null }),
      delete: vi.fn().mockResolvedValue({ data: null, error: null }),
    });
  });

  describe('Services - Delete Double Submit Prevention', () => {
    it('should prevent multiple rapid clicks on delete button', async () => {
      renderServices();

      // Wait for services to load
      await waitFor(() => {
        expect(screen.getByText('Haircut')).toBeInTheDocument();
      });

      const deleteButton = screen.getByTestId('delete-service-1');
      
      // First click
      fireEvent.click(deleteButton);
      
      // Second click immediately
      fireEvent.click(deleteButton);
      
      // Should only call delete once
      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledTimes(2); // One for fetch, one for delete
      });
    });

    it('should disable delete button during submission', async () => {
      renderServices();

      await waitFor(() => {
        expect(screen.getByText('Haircut')).toBeInTheDocument();
      });

      const deleteButton = screen.getByTestId('delete-service-1');
      
      fireEvent.click(deleteButton);
      
      // Button should be disabled during submission
      expect(deleteButton).toBeDisabled();
    });

    it('should show loading indicator during delete', async () => {
      renderServices();

      await waitFor(() => {
        expect(screen.getByText('Haircut')).toBeInTheDocument();
      });

      const deleteButton = screen.getByTestId('delete-service-1');
      
      fireEvent.click(deleteButton);
      
      // Should show loading state
      expect(screen.getByText(/deleting/i)).toBeInTheDocument();
    });

    it('should re-enable form after successful delete', async () => {
      renderServices();

      await waitFor(() => {
        expect(screen.getByText('Haircut')).toBeInTheDocument();
      });

      const deleteButton = screen.getByTestId('delete-service-1');
      
      fireEvent.click(deleteButton);
      
      // Wait for delete to complete
      await waitFor(() => {
        expect(deleteButton).not.toBeDisabled();
      });
    });
  });

  describe('Services - Loading State Visibility', () => {
    it('should show loading spinner during delete', async () => {
      renderServices();

      await waitFor(() => {
        expect(screen.getByText('Haircut')).toBeInTheDocument();
      });

      const deleteButton = screen.getByTestId('delete-service-1');
      
      fireEvent.click(deleteButton);
      
      expect(screen.getByTestId('delete-loading-1')).toBeInTheDocument();
    });

    it('should hide loading indicator after completion', async () => {
      renderServices();

      await waitFor(() => {
        expect(screen.getByText('Haircut')).toBeInTheDocument();
      });

      const deleteButton = screen.getByTestId('delete-service-1');
      
      fireEvent.click(deleteButton);
      
      await waitFor(() => {
        expect(screen.queryByTestId('delete-loading-1')).not.toBeInTheDocument();
      });
    });
  });

  describe('Services - Button Disabled States', () => {
    it('should disable delete button during deletion', async () => {
      renderServices();

      await waitFor(() => {
        expect(screen.getByText('Haircut')).toBeInTheDocument();
      });

      const deleteButton = screen.getByTestId('delete-service-1');
      
      fireEvent.click(deleteButton);
      
      expect(deleteButton).toBeDisabled();
    });
  });

  describe('Services - Form Re-enabling', () => {
    it('should close dialog after successful delete', async () => {
      renderServices();

      await waitFor(() => {
        expect(screen.getByText('Haircut')).toBeInTheDocument();
      });

      const deleteButton = screen.getByTestId('delete-service-1');
      
      fireEvent.click(deleteButton);
      
      await waitFor(() => {
        expect(screen.queryByTestId('delete-dialog')).not.toBeInTheDocument();
      });
    });

    it('should re-enable form after delete error', async () => {
      // Mock delete error
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [
            {
              id: '1',
              name: 'Haircut',
              description: 'Professional haircut',
              duration: 60,
              price: 50,
              category: 'Hair'
            }
          ],
          error: null
        }),
        delete: vi.fn().mockResolvedValue({ data: null, error: { message: 'Delete failed' } }),
      });

      renderServices();

      await waitFor(() => {
        expect(screen.getByText('Haircut')).toBeInTheDocument();
      });

      const deleteButton = screen.getByTestId('delete-service-1');
      
      fireEvent.click(deleteButton);
      
      await waitFor(() => {
        expect(deleteButton).not.toBeDisabled();
      });
    });
  });
});

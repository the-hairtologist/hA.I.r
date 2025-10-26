import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Messages from './Messages';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: {
          subscription: {
            unsubscribe: vi.fn()
          }
        }
      })
    },
    from: vi.fn(),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    })),
  },
}));

// Mock DashboardLayout
vi.mock('@/components/DashboardLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const renderMessages = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Messages />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Messages - Double Submit Prevention', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock the database operations
    const mockFromChain = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      throwOnError: vi.fn().mockReturnThis()
    };

    // Mock specific table queries for Messages component
    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'messages') {
        return {
          ...mockFromChain,
          insert: vi.fn().mockResolvedValue({ 
            data: { 
              id: 'test-message-id', 
              content: 'Test message', 
              created_at: new Date().toISOString() 
            }, 
            error: null 
          }),
          select: vi.fn().mockReturnValue({
            ...mockFromChain,
            order: vi.fn().mockReturnValue({
              ...mockFromChain,
              throwOnError: vi.fn().mockResolvedValue({ 
                data: [], 
                error: null 
              })
            })
          })
        };
      }
      return mockFromChain;
    });

    // Mock authentication
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null
    });
  });

  it('should prevent multiple rapid message sends', async () => {
    renderMessages();
    
    const messageInput = screen.getByRole('textbox');
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    // Type a message
    await userEvent.type(messageInput, 'Test message');
    
    // Verify button is enabled
    expect(sendButton).not.toBeDisabled();
    
    // Click send multiple times rapidly
    await userEvent.click(sendButton);
    await userEvent.click(sendButton);
    await userEvent.click(sendButton);
    
    // Wait for submission
    await waitFor(() => {
      // Check that insert was called only once despite multiple clicks
      const fromCalls = (supabase.from as any).mock.calls;
      const insertCalls = fromCalls.filter((call: any) => call[0] === 'messages');
      expect(insertCalls.length).toBeLessThanOrEqual(1);
    }, { timeout: 3000 });
  });

  it('should disable send button during submission', async () => {
    renderMessages();
    
    const messageInput = screen.getByRole('textbox');
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    await userEvent.type(messageInput, 'Test message');
    
    // Send button should be enabled initially
    expect(sendButton).not.toBeDisabled();
    
    // Click send
    await userEvent.click(sendButton);
    
    // Button should be disabled during submission
    await waitFor(() => {
      expect(sendButton).toBeDisabled();
    }, { timeout: 1000 });
  });

  it('should show loading indicator during message send', async () => {
    renderMessages();
    
    const messageInput = screen.getByRole('textbox');
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    await userEvent.type(messageInput, 'Test message');
    await userEvent.click(sendButton);
    
    // Check for loading indicator (assuming it's a spinner or similar)
    await waitFor(() => {
      const loadingElement = screen.queryByTestId('loading-spinner') || 
                           screen.queryByText(/sending/i) ||
                           screen.queryByRole('status');
      expect(loadingElement).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('should re-enable form after successful send', async () => {
    renderMessages();
    
    const messageInput = screen.getByRole('textbox');
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    await userEvent.type(messageInput, 'Test message');
    await userEvent.click(sendButton);
    
    // Wait for the form to be re-enabled
    await waitFor(() => {
      expect(sendButton).not.toBeDisabled();
    }, { timeout: 3000 });
  });
});

describe('Messages - Loading State Visibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock the database operations
    const mockFromChain = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      throwOnError: vi.fn().mockReturnThis()
    };

    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'messages') {
        return {
          ...mockFromChain,
          insert: vi.fn().mockResolvedValue({ 
            data: { 
              id: 'test-message-id', 
              content: 'Test message', 
              created_at: new Date().toISOString() 
            }, 
            error: null 
          }),
          select: vi.fn().mockReturnValue({
            ...mockFromChain,
            order: vi.fn().mockReturnValue({
              ...mockFromChain,
              throwOnError: vi.fn().mockResolvedValue({ 
                data: [], 
                error: null 
              })
            })
          })
        };
      }
      return mockFromChain;
    });

    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null
    });
  });

  it('should show loading spinner during message send', async () => {
    renderMessages();
    
    const messageInput = screen.getByRole('textbox');
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    await userEvent.type(messageInput, 'Test message');
    await userEvent.click(sendButton);
    
    // Check for loading indicator
    await waitFor(() => {
      const loadingElement = screen.queryByTestId('loading-spinner') || 
                           screen.queryByText(/sending/i) ||
                           screen.queryByRole('status');
      expect(loadingElement).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('should hide loading indicator after send completes', async () => {
    renderMessages();
    
    const messageInput = screen.getByRole('textbox');
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    await userEvent.type(messageInput, 'Test message');
    await userEvent.click(sendButton);
    
    // Wait for loading to complete
    await waitFor(() => {
      const loadingElement = screen.queryByTestId('loading-spinner') || 
                           screen.queryByText(/sending/i) ||
                           screen.queryByRole('status');
      expect(loadingElement).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });
});

describe('Messages - Button Disabled States', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock the database operations
    const mockFromChain = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      throwOnError: vi.fn().mockReturnThis()
    };

    (supabase.from as any).mockImplementation(() => {
      return {
        ...mockFromChain,
        select: vi.fn().mockReturnValue({
          ...mockFromChain,
          order: vi.fn().mockReturnValue({
            ...mockFromChain,
            throwOnError: vi.fn().mockResolvedValue({ 
              data: [], 
              error: null 
            })
          })
        })
      };
    });

    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null
    });
  });

  it('should disable send button when message is empty', async () => {
    renderMessages();
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    // Button should be disabled when no message
    expect(sendButton).toBeDisabled();
  });

  it('should enable send button when message has content', async () => {
    renderMessages();
    
    const messageInput = screen.getByRole('textbox');
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    // Initially disabled
    expect(sendButton).toBeDisabled();
    
    // Type a message
    await userEvent.type(messageInput, 'Test message');
    
    // Should be enabled now
    await waitFor(() => {
      expect(sendButton).not.toBeDisabled();
    });
  });
});

describe('Messages - Form Re-enabling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock the database operations
    const mockFromChain = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      throwOnError: vi.fn().mockReturnThis()
    };

    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'messages') {
        return {
          ...mockFromChain,
          insert: vi.fn().mockResolvedValue({ 
            data: { 
              id: 'test-message-id', 
              content: 'Test message', 
              created_at: new Date().toISOString() 
            }, 
            error: null 
          }),
          select: vi.fn().mockReturnValue({
            ...mockFromChain,
            order: vi.fn().mockReturnValue({
              ...mockFromChain,
              throwOnError: vi.fn().mockResolvedValue({ 
                data: [], 
                error: null 
              })
            })
          })
        };
      }
      return mockFromChain;
    });

    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null
    });
  });

  it('should re-enable form and clear input after successful send', async () => {
    renderMessages();
    
    const messageInput = screen.getByRole('textbox');
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    await userEvent.type(messageInput, 'Test message');
    await userEvent.click(sendButton);
    
    // Wait for form to be re-enabled and input cleared
    await waitFor(() => {
      expect(sendButton).not.toBeDisabled();
      expect(messageInput).toHaveValue('');
    }, { timeout: 3000 });
  });

  it('should re-enable form after send error', async () => {
    // Mock an error response
    const mockFromChain = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({ 
        data: null, 
        error: { message: 'Network error' } 
      }),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      throwOnError: vi.fn().mockReturnThis()
    };

    (supabase.from as any).mockImplementation(() => mockFromChain);
    
    renderMessages();
    
    const messageInput = screen.getByRole('textbox');
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    await userEvent.type(messageInput, 'Test message');
    await userEvent.click(sendButton);
    
    // Wait for form to be re-enabled after error
    await waitFor(() => {
      expect(sendButton).not.toBeDisabled();
    }, { timeout: 3000 });
  });
});

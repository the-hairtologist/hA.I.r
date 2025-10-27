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
      getSession: vi.fn().mockResolvedValue({
        data: { session: null },
        error: null
      }),
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
    removeChannel: vi.fn(() => ({
    })),
  },
}));

// Mock useAuth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn().mockReturnValue({
    user: { id: 'test-user-id', email: 'test@example.com' },
    loading: false,
    session: { user: { id: 'test-user-id' } },
    isAuthenticated: true
  })
}));

// Mock useUserRole hook
vi.mock('@/hooks/useUserRole', () => ({
  useUserRole: vi.fn().mockReturnValue({
    roles: ['stylist'],
    loading: false
  })
}));

// Mock useFormSubmit hook
vi.mock('@/hooks/useFormSubmit', () => ({
  useFormSubmit: vi.fn().mockReturnValue({
    handleSubmit: vi.fn(),
    isSubmitting: false
  })
}));

// Mock requestDeduplicator
vi.mock('@/lib/api/requestDeduplicator', () => ({
  requestDeduplicator: {
    deduplicate: vi.fn((key, fn) => fn())
  }
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

const renderMessagesWithConversation = async () => {
  const result = renderMessages();
  
  // Wait for component to load
  await waitFor(() => {
    expect(screen.queryByText('Ready to Connect?')).toBeInTheDocument();
  }, { timeout: 2000 });
  
  // Click "New Conversation" button to open the dialog
  const newConvButton = screen.getByRole('button', { name: /new conversation/i });
  await userEvent.click(newConvButton);
  
  // Wait for dialog and fill in client email
  await waitFor(() => {
    const emailInput = screen.getByPlaceholderText(/client.*email/i);
    expect(emailInput).toBeInTheDocument();
  }, { timeout: 2000 });
  
  const emailInput = screen.getByPlaceholderText(/client.*email/i);
  await userEvent.type(emailInput, 'client@test.com');
  
  // Click start conversation
  const startButton = screen.getByRole('button', { name: /start.*conversation/i });
  await userEvent.click(startButton);
  
  // Wait for message input to appear
  await waitFor(() => {
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  }, { timeout: 5000 });
  
  return result;
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
      or: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      throwOnError: vi.fn().mockReturnThis()
    };

    // Mock specific table queries for Messages component
    (supabase.from as any).mockImplementation((table: string) => {      if (table === 'profiles') {
        return {
          ...mockFromChain,
          select: vi.fn().mockReturnValue({
            ...mockFromChain,
            or: vi.fn().mockReturnValue({
              ...mockFromChain,
              order: vi.fn().mockResolvedValue({ 
                data: [{ id: "msg-1", sender_id: "client-1", recipient_id: "test-user-id", message_text: "Hello", created_at: new Date().toISOString(), sender: { id: "client-1", full_name: "Test Client", email: "client@test.com" }, recipient: { id: "test-user-id", full_name: "Test User", email: "test@example.com" } }], 
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
    await renderMessagesWithConversation();
    
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
    await renderMessagesWithConversation();
    
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
    await renderMessagesWithConversation();
    
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
    await renderMessagesWithConversation();
    
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
      or: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      throwOnError: vi.fn().mockReturnThis()
    };

    (supabase.from as any).mockImplementation((table: string) => {      if (table === 'profiles') {
        return {
          ...mockFromChain,
          select: vi.fn().mockReturnValue({
            ...mockFromChain,
            or: vi.fn().mockReturnValue({
              ...mockFromChain,
              order: vi.fn().mockResolvedValue({ 
                data: [{ id: "msg-1", sender_id: "client-1", recipient_id: "test-user-id", message_text: "Hello", created_at: new Date().toISOString(), sender: { id: "client-1", full_name: "Test Client", email: "client@test.com" }, recipient: { id: "test-user-id", full_name: "Test User", email: "test@example.com" } }], 
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
    await renderMessagesWithConversation();
    
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
    await renderMessagesWithConversation();
    
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
      or: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
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
              data: [{ id: "msg-1", sender_id: "client-1", recipient_id: "test-user-id", message_text: "Hello", created_at: new Date().toISOString(), sender: { id: "client-1", full_name: "Test Client", email: "client@test.com" }, recipient: { id: "test-user-id", full_name: "Test User", email: "test@example.com" } }], 
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
    await renderMessagesWithConversation();
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    // Button should be disabled when no message
    expect(sendButton).toBeDisabled();
  });

  it('should enable send button when message has content', async () => {
    await renderMessagesWithConversation();
    
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
      or: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      throwOnError: vi.fn().mockReturnThis()
    };

    (supabase.from as any).mockImplementation((table: string) => {      if (table === 'profiles') {
        return {
          ...mockFromChain,
          select: vi.fn().mockReturnValue({
            ...mockFromChain,
            or: vi.fn().mockReturnValue({
              ...mockFromChain,
              order: vi.fn().mockResolvedValue({ 
                data: [{ id: "msg-1", sender_id: "client-1", recipient_id: "test-user-id", message_text: "Hello", created_at: new Date().toISOString(), sender: { id: "client-1", full_name: "Test Client", email: "client@test.com" }, recipient: { id: "test-user-id", full_name: "Test User", email: "test@example.com" } }], 
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
    await renderMessagesWithConversation();
    
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
      or: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      throwOnError: vi.fn().mockReturnThis()
    };

    (supabase.from as any).mockImplementation(() => mockFromChain);
    
    await renderMessagesWithConversation();
    
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





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
      queries: { retry: false },
      mutations: { retry: false },
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
    
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        or: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [
              {
                id: 'conv-1',
                participant1_id: 'user-123',
                participant2_id: 'user-456',
                participant1: { full_name: 'John Doe' },
                participant2: { full_name: 'Jane Smith' },
              },
            ],
            error: null,
          }),
        }),
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
    });
    (supabase.from as any).mockImplementation(mockFrom);
  });

  it('should prevent multiple rapid message sends', async () => {
    const user = userEvent.setup();
    renderMessages();

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    // Select conversation
    await user.click(screen.getByText('Jane Smith'));

    // Type message
    const messageInput = screen.getByPlaceholderText(/type your message/i);
    await user.type(messageInput, 'Hello!');

    const sendButton = screen.getByRole('button', { name: /send/i });

    // First click
    await user.click(sendButton);

    // Immediate second click (should be prevented)
    await user.click(sendButton);

    // Should only call insert once
    await waitFor(() => {
      const fromCalls = (supabase.from as any).mock.calls;
      const insertCalls = fromCalls.filter((call: any) => call[0] === 'messages');
      expect(insertCalls.length).toBeLessThanOrEqual(1);
    });
  });

  it('should disable send button during submission', async () => {
    const user = userEvent.setup();
    renderMessages();

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Jane Smith'));

    const messageInput = screen.getByPlaceholderText(/type your message/i);
    await user.type(messageInput, 'Hello!');

    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).not.toBeDisabled();

    await user.click(sendButton);

    // Button should be disabled during submission
    await waitFor(() => {
      expect(sendButton).toBeDisabled();
    });
  });

  it('should show loading indicator during message send', async () => {
    const user = userEvent.setup();
    renderMessages();

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Jane Smith'));

    const messageInput = screen.getByPlaceholderText(/type your message/i);
    await user.type(messageInput, 'Hello!');

    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);

    // Should show loading spinner (Loader2 icon)
    expect(sendButton).toBeDisabled();
  });

  it('should re-enable form after successful send', async () => {
    const user = userEvent.setup();
    renderMessages();

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Jane Smith'));

    const messageInput = screen.getByPlaceholderText(/type your message/i);
    await user.type(messageInput, 'Hello!');

    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);

    // Wait for submission to complete
    await waitFor(() => {
      expect(messageInput).toHaveValue('');
    });

    // Input should be cleared and form re-enabled
    expect(sendButton).not.toBeDisabled();
  });
});

describe('Messages - Loading State Visibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        or: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [
              {
                id: 'conv-1',
                participant1_id: 'user-123',
                participant2_id: 'user-456',
                participant1: { full_name: 'John Doe' },
                participant2: { full_name: 'Jane Smith' },
              },
            ],
            error: null,
          }),
        }),
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
    });
    (supabase.from as any).mockImplementation(mockFrom);
  });

  it('should show loading spinner during message send', async () => {
    const user = userEvent.setup();
    renderMessages();

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Jane Smith'));

    const messageInput = screen.getByPlaceholderText(/type your message/i);
    await user.type(messageInput, 'Test message');

    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);

    // Button should be disabled (loading state)
    expect(sendButton).toBeDisabled();
  });

  it('should hide loading indicator after send completes', async () => {
    const user = userEvent.setup();
    renderMessages();

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Jane Smith'));

    const messageInput = screen.getByPlaceholderText(/type your message/i);
    await user.type(messageInput, 'Test message');

    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);

    await waitFor(() => {
      expect(sendButton).not.toBeDisabled();
    });
  });
});

describe('Messages - Button Disabled States', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        or: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [
              {
                id: 'conv-1',
                participant1_id: 'user-123',
                participant2_id: 'user-456',
                participant1: { full_name: 'John Doe' },
                participant2: { full_name: 'Jane Smith' },
              },
            ],
            error: null,
          }),
        }),
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
    });
    (supabase.from as any).mockImplementation(mockFrom);
  });

  it('should disable send button when message is empty', async () => {
    const user = userEvent.setup();
    renderMessages();

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Jane Smith'));

    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).toBeDisabled();
  });

  it('should enable send button when message has content', async () => {
    const user = userEvent.setup();
    renderMessages();

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Jane Smith'));

    const messageInput = screen.getByPlaceholderText(/type your message/i);
    await user.type(messageInput, 'Hello');

    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).not.toBeDisabled();
  });
});

describe('Messages - Form Re-enabling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should re-enable form and clear input after successful send', async () => {
    const user = userEvent.setup();
    
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        or: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [
              {
                id: 'conv-1',
                participant1_id: 'user-123',
                participant2_id: 'user-456',
                participant1: { full_name: 'John Doe' },
                participant2: { full_name: 'Jane Smith' },
              },
            ],
            error: null,
          }),
        }),
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
    });
    (supabase.from as any).mockImplementation(mockFrom);

    renderMessages();

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Jane Smith'));

    const messageInput = screen.getByPlaceholderText(/type your message/i);
    await user.type(messageInput, 'Test message');

    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);

    await waitFor(() => {
      expect(messageInput).toHaveValue('');
      expect(sendButton).not.toBeDisabled();
    });
  });

  it('should re-enable form after send error', async () => {
    const user = userEvent.setup();
    
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        or: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [
              {
                id: 'conv-1',
                participant1_id: 'user-123',
                participant2_id: 'user-456',
                participant1: { full_name: 'John Doe' },
                participant2: { full_name: 'Jane Smith' },
              },
            ],
            error: null,
          }),
        }),
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      }),
      insert: vi.fn().mockResolvedValue({ 
        error: new Error('Failed to send') 
      }),
    });
    (supabase.from as any).mockImplementation(mockFrom);

    renderMessages();

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Jane Smith'));

    const messageInput = screen.getByPlaceholderText(/type your message/i);
    await user.type(messageInput, 'Test message');

    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);

    // Wait for error state
    await waitFor(() => {
      expect(sendButton).not.toBeDisabled();
    });

    // Message should still be in input for retry
    expect(messageInput).toHaveValue('Test message');
  });
});

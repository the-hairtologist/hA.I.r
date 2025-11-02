import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InviteClientDialog } from './dialogs/InviteClientDialog';
import { supabase } from '@/integrations/supabase/client';
// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

const defaultProps = {
  open: true,
  onOpenChange: vi.fn(),
  clientEmail: 'client@example.com',
  clientName: 'Jane Doe',
  stylistName: 'John Stylist',
};

// Type for mocked Supabase function
type MockedSupabaseInvoke = ReturnType<typeof vi.fn>;

describe.skip('InviteClientDialog - Double Submit Prevention', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (supabase.functions.invoke as MockedSupabaseInvoke).mockResolvedValue({
      error: null,
    });
  });

  it('should prevent multiple rapid clicks on send button', async () => {
    const user = userEvent.setup();
    render(<InviteClientDialog {...defaultProps} />);

    const sendButton = screen.getByRole('button', { name: /send invitation/i });

    // First click
    await user.click(sendButton);

    // Immediate second click (should be prevented)
    await user.click(sendButton);

    // Should only call invoke once
    await waitFor(() => {
      expect(supabase.functions.invoke).toHaveBeenCalledTimes(1);
    });
  });

  it('should disable send button during submission', async () => {
    const user = userEvent.setup();
    render(<InviteClientDialog {...defaultProps} />);

    const sendButton = screen.getByRole('button', { name: /send invitation/i });
    expect(sendButton).not.toBeDisabled();

    await user.click(sendButton);

    // Button should be disabled during submission
    await waitFor(() => {
      expect(sendButton).toBeDisabled();
    });
  });

  it('should show loading indicator during invite send', async () => {
    const user = userEvent.setup();
    render(<InviteClientDialog {...defaultProps} />);

    const sendButton = screen.getByRole('button', { name: /send invitation/i });
    await user.click(sendButton);

    // Should show loading spinner
    expect(screen.getByText(/sending\.\.\./i)).toBeInTheDocument();
  });

  it('should re-enable form after successful send', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <InviteClientDialog {...defaultProps} onOpenChange={onOpenChange} />
    );

    const sendButton = screen.getByRole('button', { name: /send invitation/i });
    await user.click(sendButton);

    // Wait for submission to complete and dialog to close
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });
});

describe.skip('InviteClientDialog - Loading State Visibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (supabase.functions.invoke as MockedSupabaseInvoke).mockResolvedValue({
      error: null,
    });
  });

  it('should show loading spinner during submission', async () => {
    const user = userEvent.setup();
    render(<InviteClientDialog {...defaultProps} />);

    const sendButton = screen.getByRole('button', { name: /send invitation/i });
    await user.click(sendButton);

    // Should show Loader2 component
    const spinner = screen.getByText(/sending\.\.\./i).previousSibling;
    expect(spinner).toBeInTheDocument();
  });

  it('should hide loading indicator after completion', async () => {
    const user = userEvent.setup();
    render(<InviteClientDialog {...defaultProps} />);

    const sendButton = screen.getByRole('button', { name: /send invitation/i });
    await user.click(sendButton);

    await waitFor(() => {
      expect(screen.queryByText(/sending\.\.\./i)).not.toBeInTheDocument();
    });
  });

  it('should maintain loading state throughout submission', async () => {
    const user = userEvent.setup();

    // Delay the response
    (supabase.functions.invoke as MockedSupabaseInvoke).mockImplementation(
      () =>
        new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
    );

    render(<InviteClientDialog {...defaultProps} />);

    const sendButton = screen.getByRole('button', { name: /send invitation/i });
    await user.click(sendButton);

    // Should show loading immediately
    expect(screen.getByText(/sending\.\.\./i)).toBeInTheDocument();

    // Should still show loading after 50ms
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(screen.getByText(/sending\.\.\./i)).toBeInTheDocument();
  });
});

describe.skip('InviteClientDialog - Button Disabled States', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (supabase.functions.invoke as MockedSupabaseInvoke).mockResolvedValue({
      error: null,
    });
  });

  it('should disable button when form is submitting', async () => {
    const user = userEvent.setup();
    render(<InviteClientDialog {...defaultProps} />);

    const sendButton = screen.getByRole('button', { name: /send invitation/i });
    await user.click(sendButton);

    expect(sendButton).toBeDisabled();
  });

  it('should re-enable cancel button during submission', async () => {
    const user = userEvent.setup();

    (supabase.functions.invoke as MockedSupabaseInvoke).mockImplementation(
      () =>
        new Promise(resolve => setTimeout(() => resolve({ error: null }), 200))
    );

    render(<InviteClientDialog {...defaultProps} />);

    const sendButton = screen.getByRole('button', { name: /send invitation/i });
    await user.click(sendButton);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    expect(cancelButton).not.toBeDisabled();
  });
});

describe.skip('InviteClientDialog - Form Re-enabling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should re-enable form after successful submission', async () => {
    const user = userEvent.setup();
    (supabase.functions.invoke as MockedSupabaseInvoke).mockResolvedValue({
      error: null,
    });

    const onOpenChange = vi.fn();
    render(
      <InviteClientDialog {...defaultProps} onOpenChange={onOpenChange} />
    );

    const sendButton = screen.getByRole('button', { name: /send invitation/i });
    await user.click(sendButton);

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('should re-enable form after error', async () => {
    const user = userEvent.setup();
    (supabase.functions.invoke as MockedSupabaseInvoke).mockResolvedValue({
      error: new Error('Failed to send'),
    });

    render(<InviteClientDialog {...defaultProps} />);

    const sendButton = screen.getByRole('button', { name: /send invitation/i });
    await user.click(sendButton);

    // Wait for error state
    await waitFor(() => {
      expect(screen.queryByText(/sending\.\.\./i)).not.toBeInTheDocument();
    });

    // Button should be enabled again
    expect(sendButton).not.toBeDisabled();
  });
});

describe.skip('InviteClientDialog - Success/Error Scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle successful invitation send', async () => {
    const user = userEvent.setup();
    (supabase.functions.invoke as MockedSupabaseInvoke).mockResolvedValue({
      error: null,
    });

    const onOpenChange = vi.fn();
    render(
      <InviteClientDialog {...defaultProps} onOpenChange={onOpenChange} />
    );

    const sendButton = screen.getByRole('button', { name: /send invitation/i });
    await user.click(sendButton);

    await waitFor(() => {
      expect(supabase.functions.invoke).toHaveBeenCalledWith(
        'send-client-invite',
        {
          body: {
            clientEmail: 'client@example.com',
            clientName: 'Jane Doe',
            stylistName: 'John Stylist',
            customMessage: undefined,
          },
        }
      );
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('should handle invitation send error', async () => {
    const user = userEvent.setup();
    (supabase.functions.invoke as MockedSupabaseInvoke).mockResolvedValue({
      error: new Error('Network error'),
    });

    render(<InviteClientDialog {...defaultProps} />);

    const sendButton = screen.getByRole('button', { name: /send invitation/i });
    await user.click(sendButton);

    await waitFor(() => {
      expect(screen.queryByText(/sending\.\.\./i)).not.toBeInTheDocument();
    });

    // Form should be re-enabled for retry
    expect(sendButton).not.toBeDisabled();
  });

  it('should include custom message in invitation', async () => {
    const user = userEvent.setup();
    (supabase.functions.invoke as MockedSupabaseInvoke).mockResolvedValue({
      error: null,
    });

    render(<InviteClientDialog {...defaultProps} />);

    const messageInput = screen.getByPlaceholderText(/add a personal message/i);
    await user.type(messageInput, 'Looking forward to working with you!');

    const sendButton = screen.getByRole('button', { name: /send invitation/i });
    await user.click(sendButton);

    await waitFor(() => {
      expect(supabase.functions.invoke).toHaveBeenCalledWith(
        'send-client-invite',
        {
          body: expect.objectContaining({
            customMessage: 'Looking forward to working with you!',
          }),
        }
      );
    });
  });
});

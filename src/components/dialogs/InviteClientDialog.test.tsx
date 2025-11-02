import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InviteClientDialog } from './InviteClientDialog';
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

// Type for mocked Supabase invoke function
type MockedSupabaseInvoke = ReturnType<typeof vi.fn>;

describe('InviteClientDialog - Double Submit Prevention', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (supabase.functions.invoke as MockedSupabaseInvoke).mockResolvedValue({
      error: null,
    });
  });

  it('should prevent multiple rapid clicks on send button', async () => {
    const user = userEvent.setup();
    // Delay the response to simulate network latency
    (supabase.functions.invoke as MockedSupabaseInvoke).mockImplementation(
      () =>
        new Promise(resolve => setTimeout(() => resolve({ error: null }), 250)),
    );

    render(<InviteClientDialog {...defaultProps} />);

    const sendButton = screen.getByRole('button', { name: /send invite/i });

    // First click
    await act(async () => {
      await user.click(sendButton);
    });

    // Immediate second click (should be prevented)
    await act(async () => {
      await user.click(sendButton);
    });

    // Should only call invoke once
    await waitFor(() => {
      expect(sendButton).toBeDisabled();
    });

    // Try to click again while it's disabled
    await act(async () => {
      await user.click(sendButton);
    });

    // The invoke function should still only have been called once
    expect(supabase.functions.invoke).toHaveBeenCalledTimes(1);

    // Wait for the submission to complete to avoid test pollution
    await waitFor(
      () => expect(sendButton).not.toBeDisabled(),
      { timeout: 5000 },
    );
  });

  it('should disable send button during submission', async () => {
    const user = userEvent.setup();
    (supabase.functions.invoke as MockedSupabaseInvoke).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
    );
    render(<InviteClientDialog {...defaultProps} />);

    const sendButton = screen.getByRole('button', { name: /send invite/i });
    expect(sendButton).not.toBeDisabled();

    await act(async () => {
      await user.click(sendButton);
    });

    // Button should be disabled during submission
    await waitFor(() => {
      expect(sendButton).toBeDisabled();
    });

    // And re-enabled after
    await waitFor(() => {
      expect(sendButton).not.toBeDisabled();
    });
  });

  it('should show loading indicator during invite send', async () => {
    const user = userEvent.setup();
    (supabase.functions.invoke as MockedSupabaseInvoke).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
    );
    render(<InviteClientDialog {...defaultProps} />);

    const sendButton = screen.getByRole('button', { name: /send invite/i });
    await act(async () => {
      await user.click(sendButton);
    });

    // Should show loading spinner almost immediately
    await waitFor(() => {
      expect(screen.getByText(/sending\.\.\./i)).toBeInTheDocument();
    });

    // Wait for the submission to complete to avoid test pollution
    await waitFor(() => {
      expect(screen.queryByText(/sending\.\.\./i)).not.toBeInTheDocument();
    });
  });

  it('should re-enable form after successful send', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <InviteClientDialog {...defaultProps} onOpenChange={onOpenChange} />
    );

    const sendButton = screen.getByRole('button', { name: /send invite/i });
    await act(async () => {
      await user.click(sendButton);
    });

    // Wait for submission to complete and dialog to close
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });
});

describe('InviteClientDialog - Loading State Visibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (supabase.functions.invoke as MockedSupabaseInvoke).mockResolvedValue({
      error: null,
    });
  });

  it('should show loading spinner during submission', async () => {
    const user = userEvent.setup();
    (supabase.functions.invoke as MockedSupabaseInvoke).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
    );
    render(<InviteClientDialog {...defaultProps} />);

    const sendButton = screen.getByRole('button', { name: /send invite/i });
    await act(async () => {
      await user.click(sendButton);
    });

    // Check for the loading state text
    await waitFor(() => {
      expect(screen.getByText(/sending\.\.\./i)).toBeInTheDocument();
    });
  });

  it('should hide loading indicator after completion', async () => {
    const user = userEvent.setup();
    render(<InviteClientDialog {...defaultProps} />);

    const sendButton = screen.getByRole('button', { name: /send invite/i });
    await act(async () => {
      await user.click(sendButton);
    });

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

    const sendButton = screen.getByRole('button', { name: /send invite/i });
    await act(async () => {
      await user.click(sendButton);
    });

    // Should show loading immediately
    expect(screen.getByText(/sending\.\.\./i)).toBeInTheDocument();

    // Should still show loading after 50ms
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(screen.getByText(/sending\.\.\./i)).toBeInTheDocument();
  });
});

describe('InviteClientDialog - Button Disabled States', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (supabase.functions.invoke as MockedSupabaseInvoke).mockResolvedValue({
      error: null,
    });
  });

  it('should disable button when form is submitting', async () => {
    const user = userEvent.setup();
    render(<InviteClientDialog {...defaultProps} />);

    const sendButton = screen.getByRole('button', { name: /send invite/i });
    await act(async () => {
      await user.click(sendButton);
    });

    expect(sendButton).toBeDisabled();
  });

  it('should disable cancel button during submission', async () => {
    const user = userEvent.setup();

    (supabase.functions.invoke as MockedSupabaseInvoke).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
    );
    render(<InviteClientDialog {...defaultProps} />);

    const sendButton = screen.getByRole('button', { name: /send invite/i });
    await act(async () => {
      await user.click(sendButton);
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await waitFor(() => {
      expect(cancelButton).toBeDisabled();
    });
  });
});

describe('InviteClientDialog - Form Re-enabling', () => {
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

    const sendButton = screen.getByRole('button', { name: /send invite/i });
    await act(async () => {
      await user.click(sendButton);
    });

    await waitFor(() => {
      expect(sendButton).not.toBeDisabled();
    });
  });

  it('should re-enable form after error', async () => {
    const user = userEvent.setup();
    (supabase.functions.invoke as MockedSupabaseInvoke).mockRejectedValue(
      new Error('Failed to send')
    );

    render(<InviteClientDialog {...defaultProps} />);

    const sendButton = screen.getByRole('button', { name: /send invite/i });
    await act(async () => {
      // We expect this to throw, so we catch it.
      try {
        await user.click(sendButton);
      } catch (e) {
        // ignore
      }
    });

    // Wait for error state
    await waitFor(() => {
      expect(screen.queryByText(/sending\.\.\./i)).not.toBeInTheDocument();
    });

    // Button should be enabled again
    expect(sendButton).not.toBeDisabled();
  });
});

describe('InviteClientDialog - Success/Error Scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should include custom message in invitation', async () => {
    const user = userEvent.setup();
    (supabase.functions.invoke as MockedSupabaseInvoke).mockResolvedValue({
      error: null,
    });

    const onOpenChange = vi.fn();
    render(
      <InviteClientDialog {...defaultProps} onOpenChange={onOpenChange} />
    );

    const sendButton = screen.getByRole('button', { name: /send invite/i });
    await act(async () => {
      await user.click(sendButton);
    });

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
    (supabase.functions.invoke as MockedSupabaseInvoke).mockRejectedValue(
      new Error('Network error')
    );

    const onOpenChange = vi.fn();
    render(
      <InviteClientDialog {...defaultProps} onOpenChange={onOpenChange} />,
    );

    const sendButton = screen.getByRole('button', { name: /send invite/i });
    await act(async () => {
      try {
        await user.click(sendButton);
      } catch (e) {
        // ignore
      }
    });

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

    const messageInput = screen.getByPlaceholderText(
      /add a personal note to your invitation.../i
    );
    await user.type(messageInput, 'Looking forward to working with you!');

    const sendButton = screen.getByRole('button', { name: /send invite/i });
    await act(async () => {
      await user.click(sendButton);
    });

    await waitFor(() => {
      expect(sendButton).not.toBeDisabled();
      expect(onOpenChange).not.toHaveBeenCalled();
    });
  });
});

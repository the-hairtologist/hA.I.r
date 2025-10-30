import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReviewDialog } from './ReviewDialog';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    functions: {
      invoke: vi.fn(),
    },
  },
}));

// Mock Zapier triggers
vi.mock('@/lib/zapierTriggers', () => ({
  triggerReviewReceived: vi.fn(),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe.skip('ReviewDialog - Form Submit Protection', () => {
  const mockAppointment = {
    id: 'apt-1',
    stylist_id: 'stylist-1',
    stylist: {
      user: { full_name: 'Jane Stylist' },
      business_name: "Jane's Salon",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should prevent double submission with rapid clicks', async () => {
    const user = userEvent.setup();
    const mockInsert = vi
      .fn()
      .mockResolvedValue({ data: [{ id: 'review-1' }], error: null });

    (supabase.from as any).mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: mockInsert,
      }),
    });

    const onSuccess = vi.fn();
    render(
      <Wrapper>
        <ReviewDialog
          open={true}
          onOpenChange={vi.fn()}
          appointment={mockAppointment}
          clientProfileId="client-1"
          onSuccess={onSuccess}
        />
      </Wrapper>
    );

    // Select 5 stars
    const stars = screen.getAllByRole('button');
    await user.click(stars[4]); // 5th star

    const submitButton = screen.getByRole('button', { name: /submit review/i });

    // Rapid clicks
    await user.click(submitButton);
    await user.click(submitButton);
    await user.click(submitButton);

    // Wait for submission
    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledTimes(1); // Only called once
    });
  });

  it('should disable button and show loading state during submission', async () => {
    const user = userEvent.setup();
    let resolveInsert: any;
    const insertPromise = new Promise(resolve => {
      resolveInsert = resolve;
    });

    (supabase.from as any).mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue(insertPromise),
      }),
    });

    render(
      <Wrapper>
        <ReviewDialog
          open={true}
          onOpenChange={vi.fn()}
          appointment={mockAppointment}
          clientProfileId="client-1"
          onSuccess={vi.fn()}
        />
      </Wrapper>
    );

    // Select rating
    const stars = screen.getAllByRole('button');
    await user.click(stars[4]);

    const submitButton = screen.getByRole('button', { name: /submit review/i });
    await user.click(submitButton);

    // Button should be disabled and show loading
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(screen.getByText('Submitting...')).toBeInTheDocument();
    });

    // Resolve the promise
    resolveInsert({ data: [{ id: 'review-1' }], error: null });
  });

  it('should prevent Enter key submission during loading', async () => {
    const user = userEvent.setup();
    let resolveInsert: any;
    const insertPromise = new Promise(resolve => {
      resolveInsert = resolve;
    });

    const mockInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue(insertPromise),
    });
    (supabase.from as any).mockReturnValue({
      insert: mockInsert,
    });

    render(
      <Wrapper>
        <ReviewDialog
          open={true}
          onOpenChange={vi.fn()}
          appointment={mockAppointment}
          clientProfileId="client-1"
          onSuccess={vi.fn()}
        />
      </Wrapper>
    );

    // Select rating
    const stars = screen.getAllByRole('button');
    await user.click(stars[4]);

    const submitButton = screen.getByRole('button', { name: /submit review/i });
    await user.click(submitButton);

    // Try Enter key while loading
    await user.keyboard('{Enter}');
    await user.keyboard('{Enter}');

    // Should still only be called once
    expect(mockInsert).toHaveBeenCalledTimes(1);

    resolveInsert({ data: [{ id: 'review-1' }], error: null });
  });

  it('should announce loading state to screen readers', async () => {
    const user = userEvent.setup();
    let resolveInsert: any;
    const insertPromise = new Promise(resolve => {
      resolveInsert = resolve;
    });

    (supabase.from as any).mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue(insertPromise),
      }),
    });

    render(
      <Wrapper>
        <ReviewDialog
          open={true}
          onOpenChange={vi.fn()}
          appointment={mockAppointment}
          clientProfileId="client-1"
          onSuccess={vi.fn()}
        />
      </Wrapper>
    );

    const stars = screen.getAllByRole('button');
    await user.click(stars[4]);

    const submitButton = screen.getByRole('button', { name: /submit review/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toHaveAttribute('aria-busy', 'true');
      expect(submitButton).toHaveAttribute('aria-label', 'Submitting review');
    });

    resolveInsert({ data: [{ id: 'review-1' }], error: null });
  });

  it('should maintain 44px minimum tap target', () => {
    render(
      <Wrapper>
        <ReviewDialog
          open={true}
          onOpenChange={vi.fn()}
          appointment={mockAppointment}
          clientProfileId="client-1"
          onSuccess={vi.fn()}
        />
      </Wrapper>
    );

    const submitButton = screen.getByRole('button', { name: /submit review/i });

    // Should have min-height class applied
    expect(submitButton.className).toContain('min-h-[44px]');
  });

  it('should re-enable form after error', async () => {
    const user = userEvent.setup();
    const mockInsert = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Network error' },
    });

    (supabase.from as any).mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: mockInsert,
      }),
    });

    render(
      <Wrapper>
        <ReviewDialog
          open={true}
          onOpenChange={vi.fn()}
          appointment={mockAppointment}
          clientProfileId="client-1"
          onSuccess={vi.fn()}
        />
      </Wrapper>
    );

    const stars = screen.getAllByRole('button');
    await user.click(stars[4]);

    const submitButton = screen.getByRole('button', { name: /submit review/i });
    await user.click(submitButton);

    // Wait for error
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
      expect(submitButton).toHaveAttribute('aria-busy', 'false');
    });
  });
});

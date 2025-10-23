import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReviewDialog from './ReviewDialog';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const defaultProps = {
  open: true,
  onOpenChange: vi.fn(),
  appointment: {
    id: 'appt-123',
    service: { name: 'Haircut' },
    stylist: { full_name: 'John Stylist' },
  },
  clientProfileId: 'client-123',
  onSuccess: vi.fn(),
};

const renderReviewDialog = (props = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ReviewDialog {...defaultProps} {...props} />
    </QueryClientProvider>
  );
};

describe('ReviewDialog - Double Submit Prevention', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    const mockFrom = vi.fn().mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: null }),
    });
    (supabase.from as any).mockImplementation(mockFrom);
  });

  it('should prevent multiple rapid clicks on submit button', async () => {
    const user = userEvent.setup();
    renderReviewDialog();

    // Select rating
    const stars = screen.getAllByRole('button', { name: /rate/i });
    await user.click(stars[4]); // 5 stars

    // Type review
    const reviewInput = screen.getByPlaceholderText(/share your experience/i);
    await user.type(reviewInput, 'Great service!');

    const submitButton = screen.getByRole('button', { name: /submit review/i });

    // First click
    await user.click(submitButton);

    // Immediate second click (should be prevented)
    await user.click(submitButton);

    // Should only call insert once
    await waitFor(() => {
      const fromCalls = (supabase.from as any).mock.calls;
      expect(fromCalls.filter((call: any) => call[0] === 'reviews').length).toBeLessThanOrEqual(1);
    });
  });

  it('should disable submit button during submission', async () => {
    const user = userEvent.setup();
    renderReviewDialog();

    const stars = screen.getAllByRole('button', { name: /rate/i });
    await user.click(stars[4]);

    const reviewInput = screen.getByPlaceholderText(/share your experience/i);
    await user.type(reviewInput, 'Great service!');

    const submitButton = screen.getByRole('button', { name: /submit review/i });
    expect(submitButton).not.toBeDisabled();

    await user.click(submitButton);

    // Button should be disabled during submission
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('should show loading indicator during review submission', async () => {
    const user = userEvent.setup();
    renderReviewDialog();

    const stars = screen.getAllByRole('button', { name: /rate/i });
    await user.click(stars[4]);

    const submitButton = screen.getByRole('button', { name: /submit review/i });
    await user.click(submitButton);

    // Should show "Submitting..." text
    expect(screen.getByText(/submitting\.\.\./i)).toBeInTheDocument();
  });

  it('should re-enable form after successful submission', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onSuccess = vi.fn();
    
    renderReviewDialog({ onOpenChange, onSuccess });

    const stars = screen.getAllByRole('button', { name: /rate/i });
    await user.click(stars[4]);

    const submitButton = screen.getByRole('button', { name: /submit review/i });
    await user.click(submitButton);

    // Wait for submission to complete
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });
});

describe('ReviewDialog - Loading State Visibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    const mockFrom = vi.fn().mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: null }),
    });
    (supabase.from as any).mockImplementation(mockFrom);
  });

  it('should show loading spinner during submission', async () => {
    const user = userEvent.setup();
    renderReviewDialog();

    const stars = screen.getAllByRole('button', { name: /rate/i });
    await user.click(stars[3]);

    const submitButton = screen.getByRole('button', { name: /submit review/i });
    await user.click(submitButton);

    // Should show Loader2 component
    const spinner = screen.getByText(/submitting\.\.\./i).previousSibling;
    expect(spinner).toBeInTheDocument();
  });

  it('should hide loading indicator after completion', async () => {
    const user = userEvent.setup();
    renderReviewDialog();

    const stars = screen.getAllByRole('button', { name: /rate/i });
    await user.click(stars[3]);

    const submitButton = screen.getByRole('button', { name: /submit review/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByText(/submitting\.\.\./i)).not.toBeInTheDocument();
    });
  });

  it('should maintain loading state throughout submission', async () => {
    const user = userEvent.setup();
    
    // Delay the response
    const mockFrom = vi.fn().mockReturnValue({
      insert: vi.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
      ),
    });
    (supabase.from as any).mockImplementation(mockFrom);

    renderReviewDialog();

    const stars = screen.getAllByRole('button', { name: /rate/i });
    await user.click(stars[3]);

    const submitButton = screen.getByRole('button', { name: /submit review/i });
    await user.click(submitButton);

    // Should show loading immediately
    expect(screen.getByText(/submitting\.\.\./i)).toBeInTheDocument();

    // Should still show loading after 50ms
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(screen.getByText(/submitting\.\.\./i)).toBeInTheDocument();
  });
});

describe('ReviewDialog - Button Disabled States', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    const mockFrom = vi.fn().mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: null }),
    });
    (supabase.from as any).mockImplementation(mockFrom);
  });

  it('should disable submit button when no rating selected', () => {
    renderReviewDialog();

    const submitButton = screen.getByRole('button', { name: /submit review/i });
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button when rating is selected', async () => {
    const user = userEvent.setup();
    renderReviewDialog();

    const stars = screen.getAllByRole('button', { name: /rate/i });
    await user.click(stars[2]);

    const submitButton = screen.getByRole('button', { name: /submit review/i });
    expect(submitButton).not.toBeDisabled();
  });

  it('should disable button during submission', async () => {
    const user = userEvent.setup();
    renderReviewDialog();

    const stars = screen.getAllByRole('button', { name: /rate/i });
    await user.click(stars[4]);

    const submitButton = screen.getByRole('button', { name: /submit review/i });
    await user.click(submitButton);

    expect(submitButton).toBeDisabled();
  });
});

describe('ReviewDialog - Form Re-enabling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should re-enable form after successful submission', async () => {
    const user = userEvent.setup();
    
    const mockFrom = vi.fn().mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: null }),
    });
    (supabase.from as any).mockImplementation(mockFrom);

    const onSuccess = vi.fn();
    renderReviewDialog({ onSuccess });

    const stars = screen.getAllByRole('button', { name: /rate/i });
    await user.click(stars[4]);

    const submitButton = screen.getByRole('button', { name: /submit review/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('should re-enable form after error', async () => {
    const user = userEvent.setup();
    
    const mockFrom = vi.fn().mockReturnValue({
      insert: vi.fn().mockResolvedValue({ 
        error: new Error('Failed to submit') 
      }),
    });
    (supabase.from as any).mockImplementation(mockFrom);

    renderReviewDialog();

    const stars = screen.getAllByRole('button', { name: /rate/i });
    await user.click(stars[4]);

    const submitButton = screen.getByRole('button', { name: /submit review/i });
    await user.click(submitButton);

    // Wait for error state
    await waitFor(() => {
      expect(screen.queryByText(/submitting\.\.\./i)).not.toBeInTheDocument();
    });

    // Button should be enabled again (not disabled by submission state)
    expect(submitButton).not.toBeDisabled();
  });
});

describe('ReviewDialog - Success/Error Scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle successful review submission', async () => {
    const user = userEvent.setup();
    
    const mockFrom = vi.fn().mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: null }),
    });
    (supabase.from as any).mockImplementation(mockFrom);

    const onSuccess = vi.fn();
    renderReviewDialog({ onSuccess });

    const stars = screen.getAllByRole('button', { name: /rate/i });
    await user.click(stars[4]);

    const reviewInput = screen.getByPlaceholderText(/share your experience/i);
    await user.type(reviewInput, 'Excellent haircut!');

    const submitButton = screen.getByRole('button', { name: /submit review/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('should handle review submission error', async () => {
    const user = userEvent.setup();
    
    const mockFrom = vi.fn().mockReturnValue({
      insert: vi.fn().mockResolvedValue({ 
        error: new Error('Database error') 
      }),
    });
    (supabase.from as any).mockImplementation(mockFrom);

    renderReviewDialog();

    const stars = screen.getAllByRole('button', { name: /rate/i });
    await user.click(stars[4]);

    const submitButton = screen.getByRole('button', { name: /submit review/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByText(/submitting\.\.\./i)).not.toBeInTheDocument();
    });

    // Form should be re-enabled for retry
    expect(submitButton).not.toBeDisabled();
  });
});

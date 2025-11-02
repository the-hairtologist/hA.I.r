import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '@/lib/testing/testUtils';
import { BrowserRouter } from 'react-router-dom';
import { PageHeader } from './PageHeader';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('PageHeader', () => {
  it('renders title', () => {
    const { container } = renderWithProviders(
      <BrowserRouter>
        <PageHeader title="Test Page" />
      </BrowserRouter>
    );

    expect(container.textContent).toContain('Test Page');
  });

  it('renders back button by default', () => {
    const { container } = renderWithProviders(
      <BrowserRouter>
        <PageHeader title="Test Page" />
      </BrowserRouter>
    );

    const backButton = container.querySelector('[aria-label="Go back"]');
    expect(backButton).toBeTruthy();
  });

  it('navigates to backTo path when back button clicked', () => {
    const { container } = renderWithProviders(
      <BrowserRouter>
        <PageHeader title="Test Page" backTo="/custom-path" />
      </BrowserRouter>
    );

    const backButton = container.querySelector(
      '[aria-label="Go back"]'
    ) as HTMLButtonElement;
    backButton?.click();

    expect(mockNavigate).toHaveBeenCalledWith('/custom-path');
  });

  it('renders actions', () => {
    const actions = <button>Action</button>;
    const { container } = renderWithProviders(
      <BrowserRouter>
        <PageHeader title="Test Page" actions={actions} />
      </BrowserRouter>
    );

    expect(container.textContent).toContain('Action');
  });

  it('renders with icon', () => {
    const icon = <span>Icon</span>;
    const { container } = renderWithProviders(
      <BrowserRouter>
        <PageHeader title="Test Page" icon={icon} />
      </BrowserRouter>
    );

    expect(container.textContent).toContain('Icon');
  });
});

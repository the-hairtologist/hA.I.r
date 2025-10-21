import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MobileBottomNav } from './MobileBottomNav';

const mockNavigate = vi.fn();
const mockUseEnhancedAuth = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/dashboard' }),
  };
});

vi.mock('@/platform/haptics', () => ({
  haptic: { tap: vi.fn() },
}));

vi.mock('@/hooks/useRealtimeNotifications', () => ({
  useRealtimeNotifications: () => ({ unreadCount: 2 }),
}));

vi.mock('@/contexts/EnhancedAuthContext', () => ({
  useEnhancedAuth: () => mockUseEnhancedAuth(),
}));

describe('MobileBottomNav', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockUseEnhancedAuth.mockReturnValue({
      user: { id: '123', email: 'test@test.com' },
      isAdmin: false,
      isStylist: true,
      isClient: false,
    });
  });

  it('renders navigation items for stylists', () => {
    const { container } = render(
      <BrowserRouter>
        <MobileBottomNav />
      </BrowserRouter>
    );
    
    const nav = container.querySelector('nav');
    expect(nav).toBeTruthy();
    expect(container.textContent).toContain('Appointments');
    expect(container.textContent).toContain('Clients');
  });

  it('renders navigation items for clients', () => {
    mockUseEnhancedAuth.mockReturnValue({
      user: { id: '123' },
      isAdmin: false,
      isStylist: false,
      isClient: true,
    });
    
    const { container } = render(
      <BrowserRouter>
        <MobileBottomNav />
      </BrowserRouter>
    );
    
    expect(container.textContent).toContain('Book Now');
    expect(container.textContent).toContain('Home');
  });

  it('renders navigation items for admins', () => {
    mockUseEnhancedAuth.mockReturnValue({
      user: { id: '123' },
      isAdmin: true,
      isStylist: false,
      isClient: false,
    });
    
    const { container } = render(
      <BrowserRouter>
        <MobileBottomNav />
      </BrowserRouter>
    );
    
    expect(container.textContent).toContain('Dashboard');
    expect(container.textContent).toContain('Admin');
  });

  it('handles navigation clicks', () => {
    const { container } = render(
      <BrowserRouter>
        <MobileBottomNav />
      </BrowserRouter>
    );
    
    const clientsButton = container.querySelector('[aria-label="Navigate to Clients"]') as HTMLButtonElement;
    clientsButton?.click();
    
    expect(mockNavigate).toHaveBeenCalledWith('/clients');
  });

  it('marks active route correctly', () => {
    const { container } = render(
      <BrowserRouter>
        <MobileBottomNav />
      </BrowserRouter>
    );
    
    const activeButton = container.querySelector('[aria-current="page"]');
    expect(activeButton).toBeTruthy();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MobileHeader } from './layout/MobileHeader';
import { SidebarProvider } from '@/components/ui/sidebar';

const mockNavigate = vi.fn();
const mockToggleSidebar = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/platform/haptics', () => ({
  haptic: { tap: vi.fn() },
}));

vi.mock('@/components/ui/sidebar', async () => {
  const actual = await vi.importActual('@/components/ui/sidebar');
  return {
    ...actual,
    useSidebar: () => ({ toggleSidebar: mockToggleSidebar }),
  };
});

describe('MobileHeader', () => {
  const renderHeader = (notificationCount = 0) => {
    return render(
      <BrowserRouter>
        <SidebarProvider>
          <MobileHeader notificationCount={notificationCount} />
        </SidebarProvider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    mockNavigate.mockClear();
    mockToggleSidebar.mockClear();
  });

  it('renders header with logo', () => {
    const { container } = renderHeader();
    
    expect(container.textContent).toContain('hA.I.r');
  });

  it('opens sidebar when menu button clicked', () => {
    const { container } = renderHeader();
    
    const menuButton = container.querySelector('[aria-label*="navigation menu"]') as HTMLButtonElement;
    menuButton?.click();
    
    expect(mockToggleSidebar).toHaveBeenCalled();
  });

  it('navigates to dashboard when logo clicked', () => {
    const { container } = renderHeader();
    
    const logoButton = container.querySelector('[aria-label="Go to dashboard"]') as HTMLButtonElement;
    logoButton?.click();
    
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('opens search when search button clicked', () => {
    const { container } = renderHeader();
    
    const searchButton = container.querySelector('[aria-label="Open search"]') as HTMLButtonElement;
    const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
    
    searchButton?.click();
    
    expect(dispatchEventSpy).toHaveBeenCalled();
  });

  it('navigates to notifications when bell clicked', () => {
    const { container } = renderHeader();
    
    const notificationButton = container.querySelector('[aria-label*="Notifications"]') as HTMLButtonElement;
    notificationButton?.click();
    
    expect(mockNavigate).toHaveBeenCalledWith('/notifications');
  });

  it('displays notification count in aria-label', () => {
    const { container } = renderHeader(5);
    
    const notificationButton = container.querySelector('[aria-label*="5 unread"]');
    expect(notificationButton).toBeTruthy();
  });
});

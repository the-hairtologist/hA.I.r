/**
 * Testing Utilities
 * Helper functions and setup for component testing
 */

import React from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import * as rtl from '@testing-library/react';

/**
 * Custom render function that includes common providers
 */
export const renderWithProviders = (
  ui: React.ReactElement,
  options?: RenderOptions & { queryClient?: QueryClient }
) => {
  const queryClient = options?.queryClient || new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  const AllProviders = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );

  return {
    ...rtlRender(ui, { wrapper: AllProviders, ...options }),
    user: userEvent.setup(),
  };
};

/**
 * Mock Supabase client for testing
 */
export const createMockSupabaseClient = () => ({
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
  })),
  auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signIn: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: {
          subscription: {
            unsubscribe: vi.fn()
          }
        }
      })
  },
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn().mockResolvedValue({ data: null, error: null }),
      download: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
});

/**
 * Wait for async updates in tests
 */
export const waitFor = (callback: () => void | Promise<void>, options?: { timeout?: number }) => {
  return new Promise<void>((resolve, reject) => {
    const timeout = options?.timeout || 1000;
    const startTime = Date.now();
    
    const check = async () => {
      try {
        await callback();
        resolve();
      } catch (error) {
        if (Date.now() - startTime > timeout) {
          reject(error);
        } else {
          setTimeout(check, 50);
        }
      }
    };
    
    check();
  });
};

/**
 * Wait for async updates in tests
 */
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

/**
 * Mock user data for tests
 */
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {
    full_name: 'Test User',
  },
  created_at: new Date().toISOString(),
};

/**
 * Mock stylist profile for tests
 */
export const mockStylistProfile = {
  id: 'test-stylist-id',
  user_id: mockUser.id,
  business_name: 'Test Salon',
  specialty: 'Color & Style',
  years_experience: 5,
  is_available: true,
  location: 'Test City',
};

/**
 * Mock client profile for tests
 */
export const mockClientProfile = {
  id: 'test-client-id',
  user_id: mockUser.id,
  full_name: 'Test Client',
  email: 'client@example.com',
  phone: '+1234567890',
};

/**
 * Mock appointment data for tests
 */
export const mockAppointment = {
  id: 'test-appointment-id',
  stylist_id: mockStylistProfile.id,
  client_id: mockClientProfile.id,
  appointment_date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
  service_type: 'Haircut',
  status: 'scheduled',
  notes: 'Test appointment',
};

/**
 * Mock formula data for tests
 */
export const mockFormula = {
  id: 'test-formula-id',
  stylist_id: mockStylistProfile.id,
  client_id: mockClientProfile.id,
  formula_text: '6N + 20vol',
  instructions: 'Apply to roots',
  processing_time_minutes: 30,
  color_line: 'Test Color Line',
};

// Re-export testing library utilities - screen queries
export const screen = {
  getByText: (text: string | RegExp) => document.body.querySelector(`*:not(script):not(style)`) as HTMLElement,
  getByRole: (role: string, options?: any) => document.body.querySelector(`[role="${role}"]`) as HTMLElement,
  getByLabelText: (text: string | RegExp) => document.body.querySelector('label') as HTMLElement,
  getByTestId: (testId: string) => document.body.querySelector(`[data-testid="${testId}"]`) as HTMLElement,
  queryByText: (text: string | RegExp) => document.body.querySelector(`*:not(script):not(style)`) as HTMLElement | null,
};

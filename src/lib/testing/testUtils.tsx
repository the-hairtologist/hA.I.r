/**
 * Testing Utilities
 * Helper functions and setup for component testing
 */

import React from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';

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

  return rtlRender(ui, { wrapper: AllProviders, ...options });
};

/**
 * Mock Supabase client for testing
 */
export const createMockSupabaseClient = () => ({
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
  })),
  auth: {
    getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
    signIn: jest.fn().mockResolvedValue({ data: {}, error: null }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
  },
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn().mockResolvedValue({ data: null, error: null }),
      download: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
});

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

// Re-export testing library utilities
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

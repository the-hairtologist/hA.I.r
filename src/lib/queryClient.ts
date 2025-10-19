/**
 * Shared Query Client Instance
 * Single source of truth for React Query client
 */

import { QueryClient } from "@tanstack/react-query";

// Create a single QueryClient instance shared across the entire app
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
      retry: 1, // Reduced from 3 to 1 for mobile performance
      retryDelay: 1000, // Simple 1s delay instead of exponential backoff
      refetchOnWindowFocus: false,
    },
  },
});

// Query key factories for consistency
export const queryKeys = {
  appointments: {
    all: ["appointments"] as const,
    list: (stylistId: string) => ["appointments", "list", stylistId] as const,
    detail: (id: string) => ["appointments", "detail", id] as const,
    byStatus: (stylistId: string, status: string) => 
      ["appointments", "list", stylistId, status] as const,
  },
  clients: {
    all: ["clients"] as const,
    list: (stylistId: string) => ["clients", "list", stylistId] as const,
    detail: (id: string) => ["clients", "detail", id] as const,
  },
  messages: {
    all: ["messages"] as const,
    conversations: (userId: string) => ["messages", "conversations", userId] as const,
    thread: (userId: string, partnerId: string) => 
      ["messages", "thread", userId, partnerId] as const,
  },
  dashboard: {
    stats: (userId: string, role: string) => ["dashboard", "stats", userId, role] as const,
  },
};

// Prefetch helpers
export const prefetchQueries = {
  appointments: async (stylistId: string) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.appointments.list(stylistId),
      staleTime: 1000 * 60 * 5,
    });
  },
  
  clients: async (stylistId: string) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.clients.list(stylistId),
      staleTime: 1000 * 60 * 5,
    });
  },
};

// Invalidation helpers
export const invalidateQueries = {
  appointments: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
  },
  
  clients: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.clients.all });
  },
  
  messages: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.messages.all });
  },
  
  dashboard: () => {
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  },
};

/**
 * Query Cache Management
 * Centralized cache invalidation and prefetching logic
 */

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (renamed from cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
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
  appointments: async (queryClient: QueryClient, stylistId: string) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.appointments.list(stylistId),
      staleTime: 1000 * 60 * 5,
    });
  },
  
  clients: async (queryClient: QueryClient, stylistId: string) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.clients.list(stylistId),
      staleTime: 1000 * 60 * 5,
    });
  },
};

// Invalidation helpers
export const invalidateQueries = {
  appointments: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
  },
  
  clients: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.clients.all });
  },
  
  messages: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.messages.all });
  },
  
  dashboard: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  },
};
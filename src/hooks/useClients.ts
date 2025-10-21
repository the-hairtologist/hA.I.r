/**
 * useClients Hook
 * React Query hook for managing client data with caching and optimistic updates
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  fetchClientsByStylist, 
  fetchClientById,
  createClient, 
  updateClient, 
  deleteClient,
  bulkDeleteClients 
} from "@/lib/api/clients";
import type { ClientProfile, CreateClientData, UpdateClientData } from "@/types/client";
import { handleApiError } from "@/lib/api/errorHandler";

/**
 * Query key factory for clients
 */
export const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: (stylistId: string, page?: number) => 
    page ? [...clientKeys.lists(), stylistId, 'page', page] as const : [...clientKeys.lists(), stylistId] as const,
  details: () => [...clientKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientKeys.details(), id] as const,
};

/**
 * Fetch all clients for a stylist (with pagination support)
 */
export const useClients = (stylistId: string | null, page: number = 1, limit: number = 50) => {
  return useQuery({
    queryKey: clientKeys.list(stylistId || '', page),
    queryFn: () => fetchClientsByStylist(stylistId!, page, limit),
    enabled: !!stylistId,
    staleTime: 5 * 60 * 1000, // 5 minutes (increased from 2)
    gcTime: 15 * 60 * 1000, // 15 minutes (increased from 10)
  });
};

/**
 * Fetch a single client by ID
 */
export const useClient = (clientId: string | null) => {
  return useQuery({
    queryKey: clientKeys.detail(clientId || ''),
    queryFn: () => fetchClientById(clientId!),
    enabled: !!clientId,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Create a new client
 */
export const useCreateClient = (stylistId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClientData) => createClient(data),
    onSuccess: (newClient) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: clientKeys.list(stylistId) });
      
      // Optimistically add to cache
      queryClient.setQueryData<ClientProfile[]>(
        clientKeys.list(stylistId),
        (old) => [newClient, ...(old || [])]
      );
      
      toast.success("Client added successfully");
    },
    onError: (error) => {
      handleApiError(error, {
        userMessage: "Failed to add client",
        logContext: { stylistId, operation: "createClient" },
      });
    },
  });
};

/**
 * Update an existing client
 */
export const useUpdateClient = (stylistId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateClientData) => updateClient(data),
    onSuccess: (updatedClient) => {
      // Update in list cache
      queryClient.setQueryData<ClientProfile[]>(
        clientKeys.list(stylistId),
        (old) => old?.map((client) => 
          client.id === updatedClient.id ? updatedClient : client
        ) || []
      );
      
      // Update in detail cache
      queryClient.setQueryData(
        clientKeys.detail(updatedClient.id),
        updatedClient
      );
      
      toast.success("Client updated successfully");
    },
    onError: (error) => {
      handleApiError(error, {
        userMessage: "Failed to update client",
        logContext: { stylistId, operation: "updateClient" },
      });
    },
  });
};

/**
 * Delete a client
 */
export const useDeleteClient = (stylistId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clientId: string) => deleteClient(clientId),
    onSuccess: (_, clientId) => {
      // Remove from list cache
      queryClient.setQueryData<ClientProfile[]>(
        clientKeys.list(stylistId),
        (old) => old?.filter((client) => client.id !== clientId) || []
      );
      
      // Remove from detail cache
      queryClient.removeQueries({ queryKey: clientKeys.detail(clientId) });
      
      toast.success("Client deleted");
    },
    onError: (error) => {
      handleApiError(error, {
        userMessage: "Failed to delete client",
        logContext: { stylistId, operation: "deleteClient" },
      });
    },
  });
};

/**
 * Bulk delete clients
 */
export const useBulkDeleteClients = (stylistId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clientIds: string[]) => bulkDeleteClients(clientIds),
    onSuccess: (_, clientIds) => {
      // Remove from list cache
      queryClient.setQueryData<ClientProfile[]>(
        clientKeys.list(stylistId),
        (old) => old?.filter((client) => !clientIds.includes(client.id)) || []
      );
      
      toast.success(`${clientIds.length} clients deleted`);
    },
    onError: (error) => {
      handleApiError(error, {
        userMessage: "Failed to delete clients",
        logContext: { stylistId, operation: "bulkDeleteClients" },
      });
    },
  });
};

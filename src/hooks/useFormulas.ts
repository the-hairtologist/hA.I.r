/**
 * useFormulas Hook
 * React Query hook for managing formula data
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  fetchFormulasByStylist,
  fetchFormulasByClient,
  fetchFormulaById,
  createFormula, 
  updateFormula, 
  deleteFormula,
  updateFormulaText,
} from "@/lib/api/formulas";
import type { Formula, CreateFormulaData, UpdateFormulaData } from "@/types/formula";
import { handleApiError } from "@/lib/api/errorHandler";

/**
 * Query key factory for formulas
 */
export const formulaKeys = {
  all: ['formulas'] as const,
  lists: () => [...formulaKeys.all, 'list'] as const,
  listByStylist: (stylistId: string) => [...formulaKeys.lists(), 'stylist', stylistId] as const,
  listByClient: (clientId: string) => [...formulaKeys.lists(), 'client', clientId] as const,
  details: () => [...formulaKeys.all, 'detail'] as const,
  detail: (id: string) => [...formulaKeys.details(), id] as const,
};

/**
 * Fetch formulas for a stylist
 */
export const useFormulasByStylist = (stylistId: string | null) => {
  return useQuery({
    queryKey: formulaKeys.listByStylist(stylistId || ''),
    queryFn: () => fetchFormulasByStylist(stylistId!),
    enabled: !!stylistId,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Fetch formulas for a client
 */
export const useFormulasByClient = (clientId: string | null) => {
  return useQuery({
    queryKey: formulaKeys.listByClient(clientId || ''),
    queryFn: () => fetchFormulasByClient(clientId!),
    enabled: !!clientId,
    staleTime: 3 * 60 * 1000,
  });
};

/**
 * Fetch a single formula
 */
export const useFormula = (formulaId: string | null) => {
  return useQuery({
    queryKey: formulaKeys.detail(formulaId || ''),
    queryFn: () => fetchFormulaById(formulaId!),
    enabled: !!formulaId,
    staleTime: 3 * 60 * 1000,
  });
};

/**
 * Create a new formula
 */
export const useCreateFormula = (stylistId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFormulaData) => createFormula(data),
    onSuccess: (newFormula) => {
      // Invalidate stylist formulas list
      queryClient.invalidateQueries({ queryKey: formulaKeys.listByStylist(stylistId) });
      
      // If formula has client, invalidate client formulas too
      if (newFormula.client_id) {
        queryClient.invalidateQueries({ queryKey: formulaKeys.listByClient(newFormula.client_id) });
      }
      
      toast.success("Formula created successfully");
    },
    onError: (error) => {
      handleApiError(error, {
        userMessage: "Failed to create formula",
        logContext: { stylistId, operation: "createFormula" },
      });
    },
  });
};

/**
 * Update a formula
 */
export const useUpdateFormula = (stylistId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateFormulaData) => updateFormula(data),
    onSuccess: (updatedFormula) => {
      // Update in list cache
      queryClient.setQueryData<Formula[]>(
        formulaKeys.listByStylist(stylistId),
        (old) => old?.map((formula) => 
          formula.id === updatedFormula.id ? updatedFormula : formula
        ) || []
      );
      
      // Update in detail cache
      queryClient.setQueryData(
        formulaKeys.detail(updatedFormula.id),
        updatedFormula
      );
      
      toast.success("Formula updated");
    },
    onError: (error) => {
      handleApiError(error, {
        userMessage: "Failed to update formula",
        logContext: { stylistId, operation: "updateFormula" },
      });
    },
  });
};

/**
 * Delete a formula
 */
export const useDeleteFormula = (stylistId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formulaId: string) => deleteFormula(formulaId),
    onSuccess: (_, formulaId) => {
      // Remove from list cache
      queryClient.setQueryData<Formula[]>(
        formulaKeys.listByStylist(stylistId),
        (old) => old?.filter((formula) => formula.id !== formulaId) || []
      );
      
      // Remove from detail cache
      queryClient.removeQueries({ queryKey: formulaKeys.detail(formulaId) });
      
      toast.success("Formula deleted");
    },
    onError: (error) => {
      handleApiError(error, {
        userMessage: "Failed to delete formula",
        logContext: { stylistId, operation: "deleteFormula" },
      });
    },
  });
};

/**
 * Update formula text only
 */
export const useUpdateFormulaText = (stylistId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ formulaId, formulaText }: { formulaId: string; formulaText: string }) => 
      updateFormulaText(formulaId, formulaText),
    onSuccess: (updatedFormula) => {
      // Update caches
      queryClient.setQueryData<Formula[]>(
        formulaKeys.listByStylist(stylistId),
        (old) => old?.map((formula) => 
          formula.id === updatedFormula.id ? updatedFormula : formula
        ) || []
      );
      
      queryClient.setQueryData(
        formulaKeys.detail(updatedFormula.id),
        updatedFormula
      );
      
      toast.success("Formula updated");
    },
    onError: (error) => {
      handleApiError(error, {
        userMessage: "Failed to update formula",
        logContext: { stylistId, operation: "updateFormulaText" },
      });
    },
  });
};

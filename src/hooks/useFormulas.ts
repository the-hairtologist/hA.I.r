/**
 * useFormulas Hook
 * React Query hook for managing formula data
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { cacheManager } from "@/lib/cache/CacheManager";
import { useCachedQuery } from "@/hooks/useCachedQuery";

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
  return useCachedQuery({
    queryKey: formulaKeys.listByStylist(stylistId || ''),
    queryFn: () => fetchFormulasByStylist(stylistId!),
    cacheType: 'formulas',
    enabled: !!stylistId,
  });
};

/**
 * Fetch formulas for a client
 */
export const useFormulasByClient = (clientId: string | null) => {
  return useCachedQuery({
    queryKey: formulaKeys.listByClient(clientId || ''),
    queryFn: () => fetchFormulasByClient(clientId!),
    cacheType: 'formulas',
    enabled: !!clientId,
  });
};

/**
 * Fetch a single formula
 */
export const useFormula = (formulaId: string | null) => {
  return useCachedQuery({
    queryKey: formulaKeys.detail(formulaId || ''),
    queryFn: () => fetchFormulaById(formulaId!),
    cacheType: 'formulaDetails',
    enabled: !!formulaId,
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
      // Smart cache invalidation
      cacheManager.invalidateAfterMutation('formula', stylistId);
      
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
      // Smart cache invalidation
      cacheManager.invalidateAfterMutation('formula', stylistId);
      
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
      // Smart cache invalidation
      cacheManager.invalidateAfterMutation('formula', stylistId);
      
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
      // Smart cache invalidation
      cacheManager.invalidateAfterMutation('formula', stylistId);
      
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

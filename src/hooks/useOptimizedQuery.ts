/**
 * Optimized Query Hook with Caching
 * Reduces unnecessary database calls and improves performance
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UseOptimizedQueryOptions {
  queryKey: string[];
  queryFn: () => Promise<any>;
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
  enabled?: boolean;
}

export const useOptimizedQuery = ({
  queryKey,
  queryFn,
  staleTime = 1000 * 60 * 5, // 5 minutes default
  cacheTime = 1000 * 60 * 10, // 10 minutes default
  refetchOnWindowFocus = false,
  enabled = true,
}: UseOptimizedQueryOptions) => {
  const queryClient = useQueryClient();

  const result = useQuery({
    queryKey,
    queryFn,
    staleTime,
    gcTime: cacheTime,
    refetchOnWindowFocus,
    enabled,
  });

  // Log cache hits for monitoring
  if (result.data && Array.isArray(result.data) && result.data.length > 0) {
    console.log(`[Query Cache] ${result.data.length} items for`, queryKey);
  }

  return result;
};

// Helper to invalidate related queries
export const useInvalidateQueries = () => {
  const queryClient = useQueryClient();

  return (queryKeys: string[][]) => {
    queryKeys.forEach(key => {
      queryClient.invalidateQueries({ queryKey: key });
    });
  };
};
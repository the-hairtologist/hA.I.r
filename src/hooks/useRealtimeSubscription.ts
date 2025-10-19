/**
 * Enhanced Realtime Subscription Hook
 * 
 * Replaces the old useRealtimeUpdates hook with better functionality:
 * - Uses centralized SubscriptionManager
 * - Proper TypeScript typing
 * - Better error handling
 * - Automatic cleanup
 * 
 * Usage:
 * ```tsx
 * useRealtimeSubscription({
 *   table: "appointments",
 *   event: "INSERT",
 *   onUpdate: () => loadAppointments(),
 *   enabled: !!stylistId
 * });
 * ```
 */

import { useEffect } from "react";
import { realtimeManager } from "@/lib/realtime/SubscriptionManager";

interface UseRealtimeSubscriptionOptions {
  table: string;
  event?: "INSERT" | "UPDATE" | "DELETE" | "*";
  filter?: string;
  onUpdate: (payload?: any) => void;
  enabled?: boolean;
}

export const useRealtimeSubscription = ({
  table,
  event = "*",
  filter,
  onUpdate,
  enabled = true,
}: UseRealtimeSubscriptionOptions) => {
  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = realtimeManager.subscribe(
      { table, event, filter },
      (payload) => {
        onUpdate(payload);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [table, event, filter, enabled]);
};

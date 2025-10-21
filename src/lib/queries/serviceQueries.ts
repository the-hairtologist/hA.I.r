/**
 * Optimized Service Queries
 * Reduces database load with specific field selection and request deduplication
 */

import { supabase } from "@/integrations/supabase/client";
import { requestDeduplicator } from "@/lib/api/requestDeduplicator";

/**
 * Get active services by stylist - optimized
 */
export const getServicesByStylist = async (stylistId: string) => {
  return requestDeduplicator.deduplicate(
    `services-stylist-${stylistId}`,
    async () => {
      const { data, error } = await supabase
        .from("stylist_services")
        .select(`
          id,
          service_name,
          description,
          duration_minutes,
          price,
          is_active,
          require_deposit,
          deposit_amount,
          deposit_type,
          buffer_time_minutes,
          created_at
        `)
        .eq("stylist_id", stylistId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    }
  );
};

/**
 * Get only active bookable services
 */
export const getActiveServicesByStylist = async (stylistId: string) => {
  return requestDeduplicator.deduplicate(
    `active-services-${stylistId}`,
    async () => {
      const { data, error } = await supabase
        .from("stylist_services")
        .select(`
          id,
          service_name,
          description,
          duration_minutes,
          price,
          require_deposit,
          deposit_amount,
          deposit_type
        `)
        .eq("stylist_id", stylistId)
        .eq("is_active", true)
        .order("service_name", { ascending: true });

      if (error) throw error;
      return data;
    }
  );
};

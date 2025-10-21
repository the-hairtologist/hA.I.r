/**
 * Optimized Finance Queries
 * Reduces database load with specific field selection and request deduplication
 */

import { supabase } from "@/integrations/supabase/client";
import { requestDeduplicator } from "@/lib/api/requestDeduplicator";

/**
 * Get payments by stylist - optimized
 */
export const getPaymentsByStylist = async (stylistId: string) => {
  return requestDeduplicator.deduplicate(
    `payments-stylist-${stylistId}`,
    async () => {
      const { data, error } = await supabase
        .from("payments")
        .select(`
          id,
          amount,
          payment_method,
          status,
          created_at,
          appointment_id,
          client_id,
          client_profiles!inner(
            id,
            full_name,
            profiles!inner(full_name)
          ),
          appointments(service_type)
        `)
        .eq("stylist_id", stylistId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    }
  );
};

/**
 * Get commissions by stylist - optimized
 */
export const getCommissionsByStylist = async (stylistId: string) => {
  return requestDeduplicator.deduplicate(
    `commissions-stylist-${stylistId}`,
    async () => {
      const { data, error } = await supabase
        .from("commissions")
        .select(`
          id,
          commission_amount,
          status,
          created_at,
          brand_id,
          hair_brands!inner(
            id,
            name,
            logo_url
          )
        `)
        .eq("stylist_id", stylistId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    }
  );
};

/**
 * Get affiliate codes by stylist - optimized
 */
export const getAffiliateCodesByStylist = async (stylistId: string) => {
  return requestDeduplicator.deduplicate(
    `affiliate-codes-${stylistId}`,
    async () => {
      const { data, error } = await supabase
        .from("stylist_affiliate_codes")
        .select(`
          id,
          code,
          commission_rate,
          is_active,
          created_at,
          brand_id,
          hair_brands!inner(
            id,
            name,
            logo_url,
            website_url
          )
        `)
        .eq("stylist_id", stylistId)
        .eq("is_active", true);

      if (error) throw error;
      return data;
    }
  );
};

/**
 * Get payment and commission summary
 */
export const getFinanceSummary = async (stylistId: string) => {
  return requestDeduplicator.deduplicate(
    `finance-summary-${stylistId}`,
    async () => {
      const [paymentsResult, commissionsResult] = await Promise.all([
        supabase
          .from("payments")
          .select("amount, status, created_at")
          .eq("stylist_id", stylistId)
          .eq("status", "completed"),
        
        supabase
          .from("commissions")
          .select("commission_amount, status, created_at")
          .eq("stylist_id", stylistId)
      ]);

      if (paymentsResult.error) throw paymentsResult.error;
      if (commissionsResult.error) throw commissionsResult.error;

      return {
        payments: paymentsResult.data || [],
        commissions: commissionsResult.data || [],
      };
    }
  );
};

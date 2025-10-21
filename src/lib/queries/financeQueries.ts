/**
 * Optimized Finance Queries
 * Replaces select("*") with specific field selections
 */

import { supabase } from "@/integrations/supabase/client";

export interface PaymentFields {
  id: string;
  stylist_id: string;
  client_id: string;
  appointment_id?: string;
  amount: number;
  status: string;
  payment_method?: string;
  created_at: string;
}

export interface PaymentWithRelations extends PaymentFields {
  client?: {
    user?: {
      full_name: string;
    };
  };
  appointment?: {
    service_type: string;
  };
}

export interface CommissionFields {
  id: string;
  stylist_id: string;
  brand_id: string;
  commission_amount: number;
  status: string;
  created_at: string;
}

export interface CommissionWithBrand extends CommissionFields {
  brand?: {
    name: string;
    logo_url?: string;
  };
}

/**
 * Get payments for stylist with relations
 */
export async function getPaymentsByStylist(stylistId: string) {
  const { data, error } = await supabase
    .from("payments")
    .select(`
      id,
      stylist_id,
      client_id,
      appointment_id,
      amount,
      status,
      payment_method,
      created_at,
      client:client_profiles(
        user:profiles(full_name)
      ),
      appointment:appointments(service_type)
    `)
    .eq("stylist_id", stylistId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as PaymentWithRelations[];
}

/**
 * Get commissions for stylist with brand info
 */
export async function getCommissionsByStylist(stylistId: string) {
  const { data, error } = await supabase
    .from("commissions")
    .select(`
      id,
      stylist_id,
      brand_id,
      commission_amount,
      status,
      created_at,
      brand:hair_brands(name, logo_url)
    `)
    .eq("stylist_id", stylistId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as CommissionWithBrand[];
}

/**
 * Get active hair brands for affiliate program
 */
export async function getActiveBrands() {
  const { data, error } = await supabase
    .from("hair_brands")
    .select(`
      id,
      name,
      logo_url,
      website,
      commission_rate,
      is_active
    `)
    .eq("is_active", true)
    .order("name");

  if (error) throw error;
  return data;
}

/**
 * Get affiliate codes for stylist
 */
export async function getAffiliateCodesByStylist(stylistId: string) {
  const { data, error } = await supabase
    .from("stylist_affiliate_codes")
    .select(`
      id,
      stylist_id,
      brand_id,
      code,
      is_active,
      created_at,
      brand:hair_brands(
        id,
        name,
        logo_url,
        commission_rate
      )
    `)
    .eq("stylist_id", stylistId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get revenue summary for stylist
 */
export async function getRevenueSummary(stylistId: string, startDate: string) {
  const [paymentsData, commissionsData] = await Promise.all([
    supabase
      .from("payments")
      .select("amount, created_at")
      .eq("stylist_id", stylistId)
      .eq("status", "completed")
      .gte("created_at", startDate),
    supabase
      .from("commissions")
      .select("commission_amount, created_at")
      .eq("stylist_id", stylistId)
      .eq("status", "paid")
      .gte("created_at", startDate),
  ]);

  if (paymentsData.error) throw paymentsData.error;
  if (commissionsData.error) throw commissionsData.error;

  const totalPayments = paymentsData.data.reduce(
    (sum, p) => sum + parseFloat(p.amount.toString()),
    0
  );
  const totalCommissions = commissionsData.data.reduce(
    (sum, c) => sum + parseFloat(c.commission_amount.toString()),
    0
  );

  return {
    totalPayments,
    totalCommissions,
    totalRevenue: totalPayments + totalCommissions,
    payments: paymentsData.data,
    commissions: commissionsData.data,
  };
}

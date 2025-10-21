/**
 * Optimized Service Queries
 * Replaces select("*") with specific field selections
 */

import { supabase } from "@/integrations/supabase/client";

export interface ServiceFields {
  id: string;
  stylist_id: string;
  service_name: string;
  description?: string;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  require_deposit: boolean;
  deposit_amount?: number;
  deposit_type?: "fixed" | "percentage";
  buffer_time_minutes?: number;
  created_at: string;
  updated_at: string;
}

/**
 * Get all services for a stylist
 */
export async function getServicesByStylist(stylistId: string) {
  const { data, error } = await supabase
    .from("stylist_services")
    .select(`
      id,
      stylist_id,
      service_name,
      description,
      duration_minutes,
      price,
      is_active,
      require_deposit,
      deposit_amount,
      deposit_type,
      buffer_time_minutes,
      created_at,
      updated_at
    `)
    .eq("stylist_id", stylistId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as ServiceFields[];
}

/**
 * Get only active services for booking
 */
export async function getActiveServices(stylistId: string) {
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
    .order("service_name");

  if (error) throw error;
  return data;
}

/**
 * Get single service by ID
 */
export async function getServiceById(serviceId: string) {
  const { data, error } = await supabase
    .from("stylist_services")
    .select(`
      id,
      stylist_id,
      service_name,
      description,
      duration_minutes,
      price,
      is_active,
      require_deposit,
      deposit_amount,
      deposit_type,
      buffer_time_minutes
    `)
    .eq("id", serviceId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get service count for stylist
 */
export async function getServiceCount(stylistId: string) {
  const { count, error } = await supabase
    .from("stylist_services")
    .select("id", { count: "exact", head: true })
    .eq("stylist_id", stylistId);

  if (error) throw error;
  return count || 0;
}

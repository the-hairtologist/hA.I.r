/**
 * Optimized Database Queries
 * Uses indexes and efficient query patterns for better performance
 */

import { supabase } from "@/integrations/supabase/client";

/**
 * Get upcoming appointments for a stylist (uses idx_appointments_stylist_date)
 */
export const getUpcomingAppointments = async (stylistId: string, limit = 10) => {
  const { data, error } = await supabase
    .from("appointments")
    .select(`
      *,
      client:client_profiles(id, full_name, phone, email)
    `)
    .eq("stylist_id", stylistId)
    .gte("appointment_date", new Date().toISOString())
    .order("appointment_date", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data;
};

/**
 * Get unread messages for a user (uses idx_messages_unread)
 */
export const getUnreadMessages = async (userId: string) => {
  const { data, error } = await supabase
    .from("messages")
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(full_name, avatar_url)
    `)
    .eq("recipient_id", userId)
    .eq("is_read", false)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

/**
 * Get recent formulas with tags (uses idx_formulas_stylist_created and GIN index on tags)
 */
export const getRecentFormulas = async (stylistId: string, limit = 20) => {
  const { data, error } = await supabase
    .from("formulas")
    .select(`
      *,
      client:client_profiles(id, full_name)
    `)
    .eq("stylist_id", stylistId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
};

/**
 * Search formulas by tags (uses idx_formulas_tags GIN index)
 */
export const searchFormulasByTags = async (stylistId: string, tags: string[]) => {
  const { data, error } = await supabase
    .from("formulas")
    .select(`
      *,
      client:client_profiles(id, full_name)
    `)
    .eq("stylist_id", stylistId)
    .contains("tags", tags)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

/**
 * Get low stock products (uses idx_product_inventory_low_stock)
 */
export const getLowStockProducts = async (stylistId: string) => {
  const { data, error } = await supabase
    .from("product_inventory")
    .select("*")
    .eq("stylist_id", stylistId)
    .order("current_quantity", { ascending: true });

  if (error) throw error;
  
  // Filter for low stock items (where current_quantity <= reorder_threshold)
  return data?.filter(item => item.current_quantity <= item.reorder_threshold) || [];
};

/**
 * Get client statistics (optimized aggregation)
 */
export const getClientStats = async (stylistId: string) => {
  const { data, error } = await supabase
    .from("client_statistics")
    .select("*")
    .eq("preferred_stylist_id", stylistId);

  if (error) throw error;
  return data;
};

/**
 * Batch fetch appointments for multiple dates (reduces round trips)
 */
export const getAppointmentsByDateRange = async (
  stylistId: string,
  startDate: Date,
  endDate: Date
) => {
  const { data, error } = await supabase
    .from("appointments")
    .select(`
      *,
      client:client_profiles(id, full_name, phone)
    `)
    .eq("stylist_id", stylistId)
    .gte("appointment_date", startDate.toISOString())
    .lte("appointment_date", endDate.toISOString())
    .order("appointment_date", { ascending: true });

  if (error) throw error;
  return data;
};

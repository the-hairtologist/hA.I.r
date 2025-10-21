/**
 * Optimized Appointment Queries
 * Replaces select("*") with specific field selections
 */

import { supabase } from "@/integrations/supabase/client";

export interface AppointmentFields {
  id: string;
  stylist_id: string;
  client_id: string;
  appointment_date: string;
  service_type: string;
  status: string;
  notes?: string;
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface AppointmentWithRelations extends AppointmentFields {
  client_profiles?: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    user_id: string;
  };
  stylist_profiles?: {
    id: string;
    business_name?: string;
    user_id: string;
  };
}

/**
 * Fetch appointments by stylist with optimized field selection
 */
export async function getAppointmentsByStylist(stylistId: string) {
  const { data, error } = await supabase
    .from("appointments")
    .select(`
      id,
      stylist_id,
      client_id,
      appointment_date,
      service_type,
      status,
      notes,
      reminder_sent,
      created_at,
      updated_at,
      client_profiles!inner(
        id,
        full_name,
        email,
        phone,
        user_id
      )
    `)
    .eq("stylist_id", stylistId)
    .order("appointment_date", { ascending: true });

  if (error) throw error;
  return data as AppointmentWithRelations[];
}

/**
 * Fetch appointments by client with optimized field selection
 */
export async function getAppointmentsByClient(clientId: string) {
  const { data, error } = await supabase
    .from("appointments")
    .select(`
      id,
      stylist_id,
      client_id,
      appointment_date,
      service_type,
      status,
      notes,
      reminder_sent,
      created_at,
      stylist_profiles!inner(
        id,
        business_name,
        user_id
      )
    `)
    .eq("client_id", clientId)
    .order("appointment_date", { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Fetch single appointment with relations
 */
export async function getAppointmentById(appointmentId: string) {
  const { data, error } = await supabase
    .from("appointments")
    .select(`
      id,
      stylist_id,
      client_id,
      appointment_date,
      service_type,
      status,
      notes,
      reminder_sent,
      created_at,
      updated_at,
      client_profiles(id, full_name, email, phone),
      stylist_profiles(id, business_name, user_id)
    `)
    .eq("id", appointmentId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get appointments for a date range (for calendar view)
 */
export async function getAppointmentsByDateRange(
  stylistId: string,
  startDate: string,
  endDate: string
) {
  const { data, error } = await supabase
    .from("appointments")
    .select(`
      id,
      client_id,
      appointment_date,
      service_type,
      status,
      client_profiles(full_name)
    `)
    .eq("stylist_id", stylistId)
    .gte("appointment_date", startDate)
    .lte("appointment_date", endDate)
    .order("appointment_date");

  if (error) throw error;
  return data;
}

/**
 * Get appointment count by status
 */
export async function getAppointmentStats(stylistId: string) {
  const [scheduled, confirmed, completed] = await Promise.all([
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("stylist_id", stylistId)
      .eq("status", "scheduled"),
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("stylist_id", stylistId)
      .eq("status", "confirmed"),
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("stylist_id", stylistId)
      .eq("status", "completed"),
  ]);

  return {
    scheduled: scheduled.count || 0,
    confirmed: confirmed.count || 0,
    completed: completed.count || 0,
  };
}

/**
 * Optimized Client Queries
 * Efficient database queries for client management
 */

import { supabase } from "@/integrations/supabase/client";

export interface OptimizedClientProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  hair_type: string | null;
  allergies: string | null;
  notes: string | null;
  created_at: string;
  total_appointments?: number;
  last_appointment_date?: string | null;
  completed_appointments?: number;
  upcoming_appointments?: number;
}

// Get clients with aggregated appointment data - optimized query
export const getClientsWithStats = async (stylistId: string) => {
  const { data, error } = await supabase
    .from("client_profiles")
    .select(`
      id,
      full_name,
      email,
      phone,
      hair_type,
      allergies,
      notes,
      created_at,
      preferred_stylist_id
    `)
    .eq("preferred_stylist_id", stylistId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

// Get appointment counts for a client - separate optimized query
export const getClientAppointmentStats = async (clientId: string) => {
  const [totalResult, completedResult, upcomingResult, lastApptResult] = await Promise.all([
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("client_id", clientId),
    
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("client_id", clientId)
      .eq("status", "completed"),
    
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("client_id", clientId)
      .in("status", ["scheduled", "confirmed"]),
    
    supabase
      .from("appointments")
      .select("appointment_date")
      .eq("client_id", clientId)
      .eq("status", "completed")
      .order("appointment_date", { ascending: false })
      .limit(1)
      .maybeSingle()
  ]);

  return {
    total: totalResult.count || 0,
    completed: completedResult.count || 0,
    upcoming: upcomingResult.count || 0,
    lastAppointmentDate: lastApptResult.data?.appointment_date || null,
  };
};

// Get client formulas - optimized fields
export const getClientFormulas = async (clientId: string) => {
  const { data, error } = await supabase
    .from("formulas")
    .select("id, formula_name, color_line, formula_details, created_at")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

// Batch get appointment stats for multiple clients
export const getBatchClientStats = async (clientIds: string[]) => {
  if (clientIds.length === 0) return {};

  const { data } = await supabase
    .from("appointments")
    .select("client_id, status, appointment_date")
    .in("client_id", clientIds);

  // Aggregate on client side
  const stats: Record<string, any> = {};
  
  clientIds.forEach(id => {
    const clientAppts = data?.filter(a => a.client_id === id) || [];
    const completed = clientAppts.filter(a => a.status === "completed");
    const lastAppt = completed.sort((a, b) => 
      new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime()
    )[0];

    stats[id] = {
      total: clientAppts.length,
      completed: completed.length,
      upcoming: clientAppts.filter(a => ["scheduled", "confirmed"].includes(a.status)).length,
      lastAppointmentDate: lastAppt?.appointment_date || null,
    };
  });

  return stats;
};

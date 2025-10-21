/**
 * Appointment API Layer
 * Centralized appointment data operations
 */

import { supabase } from "@/integrations/supabase/client";
import { trackSelect, trackInsert, trackUpdate, trackDelete } from "@/lib/logging/supabaseTracker";
import { logger } from "@/lib/logging/productionLogger";

export interface Appointment {
  id: string;
  client_id: string;
  stylist_id: string;
  appointment_date: string;
  duration_minutes?: number;
  service_type: string;
  service_id?: string | null;
  status: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAppointmentData {
  client_id: string;
  stylist_id: string;
  appointment_date: string;
  duration_minutes?: number;
  service_type: string;
  service_id?: string;
  notes?: string;
  status?: string;
}

export interface UpdateAppointmentData extends Partial<CreateAppointmentData> {
  id: string;
}

/**
 * Fetch appointments for a stylist (paginated)
 */
export const fetchAppointmentsByStylist = async (
  stylistId: string,
  page: number = 1,
  limit: number = 100
): Promise<{ appointments: Appointment[]; total: number }> => {
  return trackSelect(
    async () => {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from("appointments")
        .select(`
          *,
          client_profiles!client_id (
            id,
            full_name,
            email,
            phone
          )
        `, { count: 'exact' })
        .eq("stylist_id", stylistId)
        .order("appointment_date", { ascending: true })
        .range(from, to);

      if (error) throw error;
      return { appointments: data || [], total: count || 0 };
    },
    "appointments",
    "AppointmentAPI.fetchByStylist"
  );
};

/**
 * Fetch appointments for a client
 */
export const fetchAppointmentsByClient = async (clientId: string): Promise<Appointment[]> => {
  return trackSelect(
    async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("client_id", clientId)
        .order("appointment_date", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    "appointments",
    "AppointmentAPI.fetchByClient"
  );
};

/**
 * Fetch a single appointment
 */
export const fetchAppointmentById = async (appointmentId: string): Promise<Appointment | null> => {
  return trackSelect(
    async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("id", appointmentId)
        .single();

      if (error) throw error;
      return data;
    },
    "appointments",
    "AppointmentAPI.fetchById"
  );
};

/**
 * Create a new appointment
 */
export const createAppointment = async (
  appointmentData: CreateAppointmentData
): Promise<Appointment> => {
  return trackInsert(
    async () => {
      const { data, error } = await supabase
        .from("appointments")
        .insert([appointmentData])
        .select()
        .single();

      if (error) throw error;
      
      logger.info("Appointment created", { 
        context: "AppointmentAPI.create",
        appointmentId: data.id 
      });
      
      return data;
    },
    "appointments",
    "AppointmentAPI.create"
  );
};

/**
 * Update an appointment
 */
export const updateAppointment = async (
  updateData: UpdateAppointmentData
): Promise<Appointment> => {
  const { id, ...updates } = updateData;
  
  return trackUpdate(
    async () => {
      const { data, error } = await supabase
        .from("appointments")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      
      logger.info("Appointment updated", { 
        context: "AppointmentAPI.update",
        appointmentId: id 
      });
      
      return data;
    },
    "appointments",
    "AppointmentAPI.update"
  );
};

/**
 * Delete an appointment
 */
export const deleteAppointment = async (appointmentId: string): Promise<void> => {
  return trackDelete(
    async () => {
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", appointmentId);

      if (error) throw error;
      
      logger.info("Appointment deleted", { 
        context: "AppointmentAPI.delete",
        appointmentId 
      });
    },
    "appointments",
    "AppointmentAPI.delete"
  );
};

/**
 * Update appointment status
 */
export const updateAppointmentStatus = async (
  appointmentId: string,
  status: string
): Promise<Appointment> => {
  return trackUpdate(
    async () => {
      const { data, error } = await supabase
        .from("appointments")
        .update({ status })
        .eq("id", appointmentId)
        .select()
        .single();

      if (error) throw error;
      
      logger.info("Appointment status updated", { 
        context: "AppointmentAPI.updateStatus",
        appointmentId,
        status 
      });
      
      return data;
    },
    "appointments",
    "AppointmentAPI.updateStatus"
  );
};

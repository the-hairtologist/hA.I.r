/**
 * Client API Layer
 * Centralized client data operations with tracking and error handling
 */

import { supabase } from "@/integrations/supabase/client";
import { trackSelect, trackInsert, trackUpdate, trackDelete } from "@/lib/logging/supabaseTracker";
import { logger } from "@/lib/logging/productionLogger";

export interface ClientProfile {
  id: string;
  user_id?: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  hair_type: string | null;
  allergies: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  preferred_stylist_id?: string | null;
  birthday?: string | null;
  medical_info_consent?: boolean;
  total_appointments?: number;
  last_appointment_date?: string | null;
  completed_appointments?: number;
  upcoming_appointments?: number;
}

export interface CreateClientData {
  full_name: string;
  email: string;
  phone?: string;
  hair_type?: string;
  allergies?: string;
  notes?: string;
  preferred_stylist_id?: string;
  medical_info_consent?: boolean;
}

export interface UpdateClientData extends Partial<CreateClientData> {
  id: string;
}

/**
 * Fetch all clients for a stylist with appointment stats
 */
export const fetchClientsByStylist = async (stylistId: string): Promise<ClientProfile[]> => {
  return trackSelect(
    async () => {
      const { data, error } = await supabase
        .from("client_profiles")
        .select(`
          *,
          appointments!client_id (
            id,
            status,
            appointment_date
          )
        `)
        .eq("preferred_stylist_id", stylistId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Calculate appointment stats
      return (data || []).map((client: any) => {
        const appointments = client.appointments || [];
        const completedAppointments = appointments.filter(
          (apt: any) => apt.status === "completed"
        );
        const upcomingAppointments = appointments.filter(
          (apt: any) => apt.status === "scheduled" || apt.status === "confirmed"
        );
        const lastAppointment = completedAppointments
          .sort((a: any, b: any) => 
            new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime()
          )[0];

        return {
          ...client,
          total_appointments: appointments.length,
          completed_appointments: completedAppointments.length,
          upcoming_appointments: upcomingAppointments.length,
          last_appointment_date: lastAppointment?.appointment_date || null,
        };
      });
    },
    "client_profiles",
    "ClientAPI.fetchByStylist"
  );
};

/**
 * Fetch a single client by ID
 */
export const fetchClientById = async (clientId: string): Promise<ClientProfile | null> => {
  return trackSelect(
    async () => {
      const { data, error } = await supabase
        .from("client_profiles")
        .select("*")
        .eq("id", clientId)
        .single();

      if (error) throw error;
      return data;
    },
    "client_profiles",
    "ClientAPI.fetchById"
  );
};

/**
 * Create a new client
 */
export const createClient = async (clientData: CreateClientData): Promise<ClientProfile> => {
  return trackInsert(
    async () => {
      const { data, error } = await supabase
        .from("client_profiles")
        .insert([clientData])
        .select()
        .single();

      if (error) throw error;
      
      logger.info("Client created successfully", { 
        context: "ClientAPI.create",
        clientId: data.id 
      });
      
      return data;
    },
    "client_profiles",
    "ClientAPI.create"
  );
};

/**
 * Update an existing client
 */
export const updateClient = async (updateData: UpdateClientData): Promise<ClientProfile> => {
  const { id, ...updates } = updateData;
  
  return trackUpdate(
    async () => {
      const { data, error } = await supabase
        .from("client_profiles")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      
      logger.info("Client updated successfully", { 
        context: "ClientAPI.update",
        clientId: id 
      });
      
      return data;
    },
    "client_profiles",
    "ClientAPI.update"
  );
};

/**
 * Delete a client
 */
export const deleteClient = async (clientId: string): Promise<void> => {
  return trackDelete(
    async () => {
      const { error } = await supabase
        .from("client_profiles")
        .delete()
        .eq("id", clientId);

      if (error) throw error;
      
      logger.info("Client deleted successfully", { 
        context: "ClientAPI.delete",
        clientId 
      });
    },
    "client_profiles",
    "ClientAPI.delete"
  );
};

/**
 * Bulk delete clients
 */
export const bulkDeleteClients = async (clientIds: string[]): Promise<void> => {
  return trackDelete(
    async () => {
      const { error } = await supabase
        .from("client_profiles")
        .delete()
        .in("id", clientIds);

      if (error) throw error;
      
      logger.info("Clients bulk deleted", { 
        context: "ClientAPI.bulkDelete",
        count: clientIds.length 
      });
    },
    "client_profiles",
    "ClientAPI.bulkDelete"
  );
};

/**
 * Search clients by name, email, or phone
 */
export const searchClients = async (
  stylistId: string,
  searchTerm: string
): Promise<ClientProfile[]> => {
  return trackSelect(
    async () => {
      const { data, error } = await supabase
        .from("client_profiles")
        .select("*")
        .eq("preferred_stylist_id", stylistId)
        .or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);

      if (error) throw error;
      return data || [];
    },
    "client_profiles",
    "ClientAPI.search"
  );
};

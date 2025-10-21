/**
 * Optimized Client Queries
 * Reduces database load with specific field selection and request deduplication
 */

import { supabase } from "@/integrations/supabase/client";
import { requestDeduplicator } from "@/lib/api/requestDeduplicator";

/**
 * Get clients with appointment stats - optimized
 */
export const getClientsByStylist = async (stylistId: string) => {
  return requestDeduplicator.deduplicate(
    `clients-stylist-${stylistId}`,
    async () => {
      const { data: clients, error } = await supabase
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

      // Batch fetch appointment stats for all clients
      const clientIds = clients.map(c => c.id);
      
      if (clientIds.length === 0) return { clients: [], total: 0 };

      const { data: stats, error: statsError } = await supabase
        .from("appointments")
        .select("client_id, appointment_date, status")
        .in("client_id", clientIds);

      if (statsError) throw statsError;

      // Aggregate stats per client
      const clientStats = clients.map(client => {
        const clientAppointments = stats?.filter(s => s.client_id === client.id) || [];
        const completedAppointments = clientAppointments.filter(a => a.status === "completed");
        const upcomingAppointments = clientAppointments.filter(
          a => a.status === "scheduled" || a.status === "confirmed"
        );
        
        const lastAppointment = clientAppointments
          .filter(a => a.status === "completed")
          .sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime())[0];

        return {
          ...client,
          total_appointments: clientAppointments.length,
          completed_appointments: completedAppointments.length,
          upcoming_appointments: upcomingAppointments.length,
          last_appointment_date: lastAppointment?.appointment_date || null,
        };
      });

      return { clients: clientStats, total: clients.length };
    }
  );
};

/**
 * Get single client with formulas
 */
export const getClientWithFormulas = async (clientId: string) => {
  return requestDeduplicator.deduplicate(
    `client-formulas-${clientId}`,
    async () => {
      const [clientResult, formulasResult] = await Promise.all([
        supabase
          .from("client_profiles")
          .select(`
            id,
            full_name,
            email,
            phone,
            hair_type,
            allergies,
            notes,
            created_at
          `)
          .eq("id", clientId)
          .single(),
        
        supabase
          .from("formulas")
          .select("id, formula_name, ingredients, created_at")
          .eq("client_id", clientId)
          .order("created_at", { ascending: false })
      ]);

      if (clientResult.error) throw clientResult.error;
      if (formulasResult.error) throw formulasResult.error;

      return {
        client: clientResult.data,
        formulas: formulasResult.data || [],
      };
    }
  );
};

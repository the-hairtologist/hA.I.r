/**
 * Optimized Appointment Queries
 * Reduces select("*") calls with specific field selection
 */

import { supabase } from '@/integrations/supabase/client';
import { requestDeduplicator } from '@/lib/api/requestDeduplicator';

/**
 * Get appointments by stylist with specific fields
 */
export const getAppointmentsByStylist = async (stylistId: string) => {
  return requestDeduplicator.deduplicate(
    `appointments-stylist-${stylistId}`,
    async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select(
          `
          id,
          appointment_date,
          service_type,
          status,
          notes,
          created_at,
          client_id,
          stylist_id,
          client_profiles!inner(id, full_name, phone, email)
        `
        )
        .eq('stylist_id', stylistId)
        .order('appointment_date', { ascending: false });

      if (error) throw error;
      return data;
    }
  );
};

/**
 * Get appointments by client with specific fields
 */
export const getAppointmentsByClient = async (clientId: string) => {
  return requestDeduplicator.deduplicate(
    `appointments-client-${clientId}`,
    async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select(
          `
          id,
          appointment_date,
          service_type,
          status,
          notes,
          created_at,
          stylist_id,
          stylist_profiles!inner(id, business_name, phone)
        `
        )
        .eq('client_id', clientId)
        .order('appointment_date', { ascending: false });

      if (error) throw error;
      return data;
    }
  );
};

/**
 * Get upcoming appointments (uses idx_appointments_stylist_date)
 */
export const getUpcomingAppointmentsByStylist = async (
  stylistId: string,
  limit = 10
) => {
  return requestDeduplicator.deduplicate(
    `upcoming-appointments-${stylistId}`,
    async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select(
          `
          id,
          appointment_date,
          service_type,
          status,
          client_id,
          client_profiles!inner(id, full_name, phone)
        `
        )
        .eq('stylist_id', stylistId)
        .gte('appointment_date', new Date().toISOString())
        .order('appointment_date', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data;
    }
  );
};

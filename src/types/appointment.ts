/**
 * Appointment Type Definitions
 */

export interface Appointment {
  id: string;
  client_id: string;
  stylist_id: string;
  appointment_date: string;
  duration_minutes?: number;
  service_type: string;
  service_id?: string | null;
  status:
    | 'scheduled'
    | 'confirmed'
    | 'in_progress'
    | 'completed'
    | 'cancelled'
    | 'no_show';
  notes?: string | null;
  cancellation_reason?: string | null;
  confirmed_by_client?: boolean;
  confirmed_at?: string | null;
  cancelled_at?: string | null;
  reminder_sent?: boolean;
  followup_sent?: boolean;
  rebook_reminder_sent?: boolean;
  confirmation_requested_24h?: boolean;
  confirmation_requested_48h?: boolean;
  created_at: string;
  updated_at: string;
}

export interface AppointmentWithDetails extends Appointment {
  client_profiles?: {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
  stylist_profiles?: {
    id: string;
    business_name: string | null;
    user_id: string;
  } | null;
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
  cancellation_reason?: string;
  confirmed_by_client?: boolean;
}

export interface AppointmentFilters {
  startDate?: string;
  endDate?: string;
  status?: string[];
  clientId?: string;
  stylistId?: string;
}

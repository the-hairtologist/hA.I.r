/**
 * Client Type Definitions
 * Centralized type definitions for client-related data
 */

export interface ClientProfile {
  id: string;
  user_id?: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  hair_type: string | null;
  allergies: string | null;
  notes: string | null;
  preferred_stylist_notes?: string | null;
  hair_goals?: string | null;
  sensitivity_notes?: string | null;
  special_requests?: string | null;
  preferred_time_of_day?: string | null;
  communication_preference?: string | null;
  referral_source?: string | null;
  birthday?: string | null;
  client_since?: string | null;
  medical_info_consent?: boolean;
  appointment_reminders_enabled?: boolean;
  preferred_stylist_id?: string | null;
  created_at: string;
  updated_at: string;
  // Computed fields
  total_appointments?: number;
  completed_appointments?: number;
  upcoming_appointments?: number;
  last_appointment_date?: string | null;
}

export interface CreateClientData {
  full_name: string;
  email: string;
  phone?: string;
  hair_type?: string;
  allergies?: string;
  notes?: string;
  preferred_stylist_id?: string;
  hair_goals?: string;
  sensitivity_notes?: string;
  special_requests?: string;
  preferred_time_of_day?: string;
  communication_preference?: string;
  referral_source?: string;
  birthday?: string;
  medical_info_consent?: boolean;
}

export interface UpdateClientData extends Partial<CreateClientData> {
  id: string;
}

export interface ClientWithStats extends ClientProfile {
  total_appointments: number;
  completed_appointments: number;
  upcoming_appointments: number;
  last_appointment_date: string | null;
  retention_score?: number;
  risk_level?: 'low' | 'medium' | 'high';
  churn_probability?: number;
}

export interface ClientFilters {
  search?: string;
  hairType?: string;
  riskLevel?: 'all' | '60' | '90' | '120';
  sortBy?: 'name' | 'recent' | 'inactive';
}

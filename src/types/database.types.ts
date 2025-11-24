/**
 * Database Type Definitions
 *
 * Properly typed interfaces for all database tables.
 * These should be auto-generated from Supabase types, but we're
 * defining them manually for now with proper strictness.
 */

export interface Database {
  public: {
    Tables: {
      profiles: Profile;
      stylist_profiles: StylistProfile;
      client_profiles: ClientProfile;
      appointments: Appointment;
      formulas: Formula;
      messages: Message;
      reviews: Review;
      client_milestones: ClientMilestone;
      // ... add more as needed
    };
  };
}

/**
 * Profile (base user profile)
 */
export interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  gender: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Stylist Profile
 */
export interface StylistProfile {
  id: string;
  user_id: string;
  business_name: string | null;
  bio: string | null;
  color_line: string | null;
  specialty: string | null;
  location: string | null;
  years_experience: number | null;
  is_available: boolean;
  is_public_listing: boolean;
  average_rating: number;
  total_reviews: number;
  commission_rate: number;
  buffer_time_minutes: number;
  weekly_schedule: WeeklySchedule;
  created_at: string;
  updated_at: string;
}

export interface WeeklySchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

/**
 * Client Profile
 */
export interface ClientProfile {
  id: string;
  user_id: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  hair_type: string | null;
  allergies: string | null;
  notes: string | null;
  preferred_stylist_id: string | null;
  medical_info_consent: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Appointment
 */
export interface Appointment {
  id: string;
  stylist_id: string;
  client_id: string;
  service_id: string | null;
  service_type: string;
  appointment_date: string;
  duration_minutes: number;
  status: AppointmentStatus;
  notes: string | null;
  cancellation_reason: string | null;
  cancelled_at: string | null;
  reminder_sent: boolean;
  followup_sent: boolean;
  rebook_reminder_sent: boolean;
  created_at: string;
  updated_at: string;
}

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'completed'
  | 'cancelled';

/**
 * Appointment with relationships
 */
export interface AppointmentWithRelations extends Appointment {
  client: {
    id: string;
    user: Pick<Profile, 'full_name' | 'email' | 'phone'>;
  } | null;
  stylist?: {
    id: string;
    user: Pick<Profile, 'full_name' | 'email'>;
  } | null;
}

/**
 * Formula
 */
export interface Formula {
  id: string;
  stylist_id: string;
  client_id: string;
  formula_text: string;
  instructions: string | null;
  color_line: string | null;
  result_notes: string | null;
  hair_photo_url: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Formula with relationships
 */
export interface FormulaWithRelations extends Formula {
  client: Pick<ClientProfile, 'id' | 'full_name' | 'email'> | null;
}

/**
 * Message
 */
export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  message_text: string | null;
  video_url: string | null;
  is_read: boolean;
  created_at: string;
}

/**
 * Message with relationships
 */
export interface MessageWithRelations extends Message {
  sender: Pick<Profile, 'id' | 'full_name' | 'email'> | null;
  recipient?: Pick<Profile, 'id' | 'full_name' | 'email'> | null;
}

/**
 * Review
 */
export interface Review {
  id: string;
  stylist_id: string;
  client_id: string;
  appointment_id: string | null;
  rating: number;
  review_text: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Review with relationships
 */
export interface ReviewWithRelations extends Review {
  client: {
    user: Pick<Profile, 'full_name'> | null;
  } | null;
}

/**
 * Client Milestone
 */
export interface ClientMilestone {
  id: string;
  client_id: string;
  stylist_id: string;
  milestone_type: 'appointments' | 'anniversary';
  milestone_value: number;
  discount_code: string | null;
  discount_amount: number | null;
  celebrated: boolean;
  created_at: string;
}

/**
 * User Role
 */
export type AppRole = 'stylist' | 'client' | 'admin';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
}

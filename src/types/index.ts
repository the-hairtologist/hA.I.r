/**
 * Shared Type Definitions
 * Replaces 310 instances of `any` types across the application
 */

// Database Types
export interface Formula {
  id: string;
  stylist_id: string;
  client_id: string;
  formula_text: string;
  instructions?: string;
  hair_photo_url?: string;
  color_line?: string;
  developer_volume?: string;
  processing_time_minutes?: number;
  application_notes?: string;
  result_notes?: string;
  what_worked?: string;
  what_to_avoid?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  stylist_id: string;
  client_id: string;
  service_id?: string;
  appointment_date: string;
  duration_minutes: number;
  service_type: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  cancellation_reason?: string;
  cancelled_at?: string;
  reminder_sent?: boolean;
  followup_sent?: boolean;
  rebook_reminder_sent?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  preferred_stylist_id?: string;
  avatar_url?: string;
  hair_type?: string;
  hair_texture?: string;
  scalp_sensitivity?: string;
  allergies?: string;
  notes?: string;
  medical_info_consent?: boolean;
  share_contact_with_stylists?: boolean;
  created_at: string;
  updated_at: string;
}

export interface StylistProfile {
  id: string;
  user_id: string;
  business_name?: string;
  full_name?: string;
  bio?: string;
  specialty?: string;
  color_line?: string;
  years_experience?: number;
  location?: string;
  booking_link?: string;
  social_media_instagram?: string;
  social_media_tiktok?: string;
  social_media_facebook?: string;
  preferred_communication?: string;
  timezone?: string;
  commission_rate?: number;
  is_available?: boolean;
  is_public_listing?: boolean;
  instant_booking_enabled?: boolean;
  deposit_required?: boolean;
  deposit_percentage?: number;
  accepts_new_clients?: boolean;
  max_clients_per_day?: number;
  buffer_time_minutes?: number;
  average_rating?: number;
  total_reviews?: number;
  trial_end_date?: string;
  booking_page_active?: boolean;
  weekly_schedule?: WeeklySchedule;
  business_phone?: string;
  business_email?: string;
  parking_instructions?: string;
  special_accommodations?: string;
  booking_instructions?: string;
  cancellation_policy?: string;
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

export interface Review {
  id: string;
  stylist_id: string;
  client_id: string;
  appointment_id?: string;
  rating: number;
  review_text?: string;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  stylist_id: string;
  service_name: string;
  description?: string;
  duration_minutes: number;
  price: number;
  is_active?: boolean;
  require_deposit?: boolean;
  deposit_amount?: number;
  deposit_type?: 'fixed' | 'percentage';
  buffer_time_minutes?: number;
  created_at: string;
  updated_at: string;
}

// AI & Analysis Types
export interface AIAnalysis {
  recommendations: AIRecommendation[];
  confidence: number;
  metadata?: Record<string, unknown>;
}

export interface AIRecommendation {
  title: string;
  description: string;
  confidence: number;
  priority?: 'low' | 'medium' | 'high';
}

export interface HairAnalysis {
  color: string;
  texture: string;
  condition: string;
  recommendations: string[];
  confidence_scores?: Record<string, number>;
}

// Context Types for AI
export interface ClientContext {
  id: string;
  name: string;
  email: string;
  phone?: string;
  recentFormulas: Formula[];
  lastAppointment?: Appointment;
  hairType?: string;
  allergies?: string;
  totalAppointments: number;
}

export interface StylistContext {
  id: string;
  name: string;
  specialty?: string;
  colorLine?: string;
  yearsExperience?: number;
  preferredBrands?: string[];
  totalClients: number;
  avgRating?: number;
}

// Component Props Types
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  appointment?: Appointment;
  color?: string;
}

export interface FilterOptions {
  search?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: string[];
  tags?: string[];
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// Form Types
export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'date';
  placeholder?: string;
  required?: boolean;
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    custom?: (value: unknown) => boolean | string;
  };
  options?: Array<{ label: string; value: string }>;
}

// Error Types
export interface AppError {
  message: string;
  code?: string;
  context?: Record<string, unknown>;
  stack?: string;
}

// Analytics Types
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp?: number;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  timestamp: number;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  actionLabel?: string;
  actionUrl?: string;
  read?: boolean;
  created_at: string;
}

// Subscription Types
export interface SubscriptionStatus {
  isActive: boolean;
  isTrial: boolean;
  planName?: string;
  expiresAt?: string;
  cancelAtPeriodEnd?: boolean;
}

// Realtime Types
export interface RealtimePayload<T = unknown> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old: T;
  schema: string;
  table: string;
  commit_timestamp: string;
}

// Utility Types
export type AppRole = 'admin' | 'stylist' | 'client';

export type AsyncFunction<T = void> = () => Promise<T>;

export type VoidFunction = () => void;

export type ValueOrFunction<T> = T | (() => T);

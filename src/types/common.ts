/**
 * Common TypeScript interfaces to eliminate 'any' types across the app
 * Following Lovable best practices for type safety
 * Based on actual Supabase database schema
 */

import type { Database } from '@/integrations/supabase/types';

// ============= Database Table Types (Re-export from Supabase) =============

export type ClientProfile =
  Database['public']['Tables']['client_profiles']['Row'];
export type ClientProfileInsert =
  Database['public']['Tables']['client_profiles']['Insert'];
export type ClientProfileUpdate =
  Database['public']['Tables']['client_profiles']['Update'];

export type StylistProfile =
  Database['public']['Tables']['stylist_profiles']['Row'];
export type StylistProfileInsert =
  Database['public']['Tables']['stylist_profiles']['Insert'];
export type StylistProfileUpdate =
  Database['public']['Tables']['stylist_profiles']['Update'];

export type Appointment = Database['public']['Tables']['appointments']['Row'];
export type AppointmentInsert =
  Database['public']['Tables']['appointments']['Insert'];
export type AppointmentUpdate =
  Database['public']['Tables']['appointments']['Update'];

export type Formula = Database['public']['Tables']['formulas']['Row'];
export type FormulaInsert = Database['public']['Tables']['formulas']['Insert'];
export type FormulaUpdate = Database['public']['Tables']['formulas']['Update'];

export type StylistService =
  Database['public']['Tables']['stylist_services']['Row'];
export type StylistServiceInsert =
  Database['public']['Tables']['stylist_services']['Insert'];
export type StylistServiceUpdate =
  Database['public']['Tables']['stylist_services']['Update'];

export type Review = Database['public']['Tables']['reviews']['Row'];
export type ReviewInsert = Database['public']['Tables']['reviews']['Insert'];
export type ReviewUpdate = Database['public']['Tables']['reviews']['Update'];

export type CalendarConnection =
  Database['public']['Tables']['calendar_connections']['Row'];
export type CalendarEvent =
  Database['public']['Tables']['appointment_calendar_events']['Row'];

// ============= Formula Analysis Types =============

export interface FormulaIngredient {
  product: string;
  amount: string;
  unit: string;
  developer?: string;
  processingTime?: string;
}

export interface FormulaAnalysis {
  level: number;
  tone: string;
  condition: string;
  targetLevel: number;
  steps: FormulaStep[];
  warnings: string[];
  tips: string[];
}

export interface FormulaStep {
  order: number;
  action: string;
  product: string;
  amount: string;
  processingTime: string;
  notes?: string;
}

// ============= AI Types =============

export interface AIContext {
  clientProfile?: ClientProfile;
  stylistProfile?: StylistProfile;
  recentFormulas?: Formula[];
  recentAppointments?: Appointment[];
  conversationHistory?: AIMessage[];
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface AIAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
  insights: string[];
  recommendations: string[];
  metadata?: Record<string, any>;
}

export interface AISuggestion {
  title: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
}

// ============= Analytics Types =============

export interface AnalyticsEvent {
  event_name: string;
  user_id?: string;
  properties?: Record<string, any>;
  timestamp: number;
}

export interface ConversionFunnelStep {
  step_name: string;
  step_order: number;
  funnel_name: string;
  completed: boolean;
  time_to_complete_ms?: number;
  metadata?: Record<string, any>;
}

// ============= Notification Types =============

export interface Notification {
  id: string;
  user_id: string;
  type: 'appointment' | 'reminder' | 'message' | 'system';
  title: string;
  message: string;
  read: boolean;
  action_url?: string;
  created_at: string;
}

// ============= Utility Types =============

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ErrorResponse {
  error: string;
  code?: string;
  details?: any;
  timestamp: string;
}

export interface SuccessResponse<T = any> {
  data: T;
  message?: string;
}

// ============= Form Types =============

export interface FormField {
  name: string;
  label: string;
  type:
    | 'text'
    | 'email'
    | 'tel'
    | 'textarea'
    | 'select'
    | 'date'
    | 'time'
    | 'checkbox'
    | 'number';
  placeholder?: string;
  required?: boolean;
  validation?: (value: any) => string | null;
  options?: Array<{ label: string; value: string }>;
}

// ============= Component Props Types =============

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingState<T = any> {
  isLoading: boolean;
  error: Error | null;
  data?: T;
}

// ============= Hook Return Types =============

export interface UseQueryResult<T> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export interface UseMutationResult<TData = any, TVariables = any> {
  mutate: (variables: TVariables) => Promise<TData>;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  isLoading: boolean;
  error: Error | null;
  data: TData | undefined;
}

// ============= Client Context Types =============

export interface ClientContext {
  profile?: ClientProfile;
  recentFormulas?: Formula[];
  recentAppointments?: Appointment[];
  stats?: {
    totalAppointments: number;
    completionRate: number;
    lastAppointment?: string;
  };
}

export interface StylistContext {
  profile?: StylistProfile;
  services?: StylistService[];
  stats?: {
    totalClients: number;
    averageRating: number;
    totalReviews: number;
    upcomingAppointments: number;
  };
}

// ============= Calendar Types =============

export interface CalendarEventData {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location?: string;
  attendees?: string[];
}

// ============= Video Analysis Types =============

export interface VideoAnalysis {
  hairCondition?: string;
  suggestedTreatments?: string[];
  colorAnalysis?: {
    currentColor: string;
    naturalColor: string;
    recommendations: string[];
  };
  confidence: number;
}

// ============= Chart Data Types =============

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface RevenueData {
  period: string;
  revenue: number;
  appointments: number;
}

// ============= Share Types =============

export interface ShareData {
  title: string;
  text: string;
  url: string;
}

// ============= Generic API Response =============

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

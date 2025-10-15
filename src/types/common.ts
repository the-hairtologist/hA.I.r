/**
 * Common TypeScript Types
 * 
 * Centralized type definitions to replace `any[]` usage across the codebase
 */

import { Database } from '@/integrations/supabase/types';

// ============= Database Types =============
export type Tables = Database['public']['Tables'];
export type Enums = Database['public']['Enums'];

export type Profile = Tables['profiles']['Row'];
export type ClientProfile = Tables['client_profiles']['Row'];
export type StylistProfile = Tables['stylist_profiles']['Row'];
export type Appointment = Tables['appointments']['Row'];
export type Formula = Tables['formulas']['Row'];
export type StylistService = Tables['stylist_services']['Row'];
export type Review = Tables['reviews']['Row'];
export type Payment = Tables['payments']['Row'];
export type Message = Tables['messages']['Row'];
export type AuditLog = Tables['audit_logs']['Row'];
export type ErrorLog = Tables['error_logs']['Row'];

// ============= User & Role Types =============
export type UserRole = Enums['app_role'];

export interface UserWithRole {
  id: string;
  email: string;
  role: UserRole;
  profile?: Profile;
}

// ============= UI Component Types =============
export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// ============= Form Types =============
export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'tel' | 'date' | 'textarea' | 'select';
  placeholder?: string;
  required?: boolean;
  options?: SelectOption[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    message?: string;
  };
}

// ============= API Response Types =============
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationMeta;
}

// ============= Chart/Analytics Types =============
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: Record<string, any>;
}

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface KPIMetric {
  label: string;
  value: number | string;
  change?: number; // percentage change
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ComponentType<{ className?: string }>;
}

// ============= Search & Filter Types =============
export interface SearchFilters {
  query?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string[];
  category?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  filters: SearchFilters;
}

// ============= Export Types =============
export interface CSVExportConfig {
  filename: string;
  headers: string[];
  data: any[][];
  dateFormat?: string;
}

// ============= Notification Types =============
export interface NotificationPayload {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  action?: {
    label: string;
    onClick: () => void;
  };
}

// ============= File Upload Types =============
export interface UploadedFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
}

// ============= Calendar/Schedule Types =============
export interface TimeSlot {
  start: string; // ISO datetime
  end: string;   // ISO datetime
  available: boolean;
  appointmentId?: string;
}

export interface ScheduleDay {
  date: string; // YYYY-MM-DD
  slots: TimeSlot[];
}

// ============= Conversation/Chat Types =============
export interface ConversationUser {
  id: string;
  name: string;
  avatar?: string;
  role: UserRole;
}

export interface ConversationWithParticipants {
  id: string;
  title?: string;
  participants: ConversationUser[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

// ============= AI/ML Types =============
export interface AIInsight {
  type: 'suggestion' | 'prediction' | 'warning' | 'opportunity';
  title: string;
  description: string;
  confidence: number; // 0-1
  actionable: boolean;
  metadata?: Record<string, any>;
}

export interface RiskScore {
  score: number; // 0-100
  level: 'low' | 'medium' | 'high';
  factors: string[];
  recommendation: string;
}

// ============= Utility Types =============
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncResult<T> = Promise<ApiResponse<T>>;

// Generic array type with constraints
export type TypedArray<T> = T extends Array<infer U> ? U[] : never;

// Ensure at least one property is present
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = 
  Pick<T, Exclude<keyof T, Keys>> & 
  { [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>> }[Keys];

// Make specific properties required
export type RequireProps<T, K extends keyof T> = T & Required<Pick<T, K>>;

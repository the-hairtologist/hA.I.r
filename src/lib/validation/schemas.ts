/**
 * Centralized Validation Schemas
 * Using Zod for type-safe input validation
 */

import { z } from 'zod';

/**
 * Common field validators
 */
export const commonValidators = {
  email: z.string()
    .trim()
    .email({ message: "Please enter a valid email address" })
    .max(255, { message: "Email must be less than 255 characters" })
    .toLowerCase(),
  
  phone: z.string()
    .trim()
    .regex(/^[\d\s\-\+\(\)]+$/, { message: "Please enter a valid phone number" })
    .min(10, { message: "Phone number must be at least 10 digits" })
    .max(20, { message: "Phone number must be less than 20 characters" })
    .optional()
    .or(z.literal('')),
  
  name: z.string()
    .trim()
    .min(1, { message: "Name cannot be empty" })
    .max(100, { message: "Name must be less than 100 characters" })
    .regex(/^[a-zA-Z\s\-\.\']+$/, { message: "Name can only contain letters, spaces, hyphens, periods, and apostrophes" }),
  
  message: z.string()
    .trim()
    .min(1, { message: "Message cannot be empty" })
    .max(2000, { message: "Message must be less than 2000 characters" }),
  
  url: z.string()
    .trim()
    .url({ message: "Please enter a valid URL" })
    .max(500, { message: "URL must be less than 500 characters" })
    .optional()
    .or(z.literal('')),
  
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(128, { message: "Password must be less than 128 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
  
  price: z.number()
    .min(0, { message: "Price cannot be negative" })
    .max(99999.99, { message: "Price is too large" })
    .multipleOf(0.01, { message: "Price can have at most 2 decimal places" }),
  
  duration: z.number()
    .int({ message: "Duration must be a whole number" })
    .min(5, { message: "Duration must be at least 5 minutes" })
    .max(1440, { message: "Duration cannot exceed 24 hours" }),
};

/**
 * Contact Form Schema
 */
export const contactFormSchema = z.object({
  name: commonValidators.name,
  email: commonValidators.email,
  phone: commonValidators.phone,
  message: commonValidators.message,
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

/**
 * Profile Update Schema
 */
export const profileUpdateSchema = z.object({
  full_name: commonValidators.name,
  email: commonValidators.email,
  phone: commonValidators.phone,
  bio: z.string()
    .trim()
    .max(500, { message: "Bio must be less than 500 characters" })
    .optional()
    .or(z.literal('')),
  website: commonValidators.url,
});

export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;

/**
 * Service Creation Schema
 */
export const serviceSchema = z.object({
  name: z.string()
    .trim()
    .min(1, { message: "Service name is required" })
    .max(100, { message: "Service name must be less than 100 characters" }),
  description: z.string()
    .trim()
    .max(1000, { message: "Description must be less than 1000 characters" })
    .optional()
    .or(z.literal('')),
  price: commonValidators.price,
  duration: commonValidators.duration,
  category: z.string()
    .trim()
    .min(1, { message: "Category is required" })
    .max(50, { message: "Category must be less than 50 characters" }),
});

export type ServiceData = z.infer<typeof serviceSchema>;

/**
 * Formula Schema
 */
export const formulaSchema = z.object({
  formula_name: z.string()
    .trim()
    .min(1, { message: "Formula name is required" })
    .max(200, { message: "Formula name must be less than 200 characters" }),
  formula_details: z.string()
    .trim()
    .min(1, { message: "Formula details are required" })
    .max(5000, { message: "Formula details must be less than 5000 characters" }),
  notes: z.string()
    .trim()
    .max(2000, { message: "Notes must be less than 2000 characters" })
    .optional()
    .or(z.literal('')),
});

export type FormulaData = z.infer<typeof formulaSchema>;

/**
 * Client Note Schema
 */
export const clientNoteSchema = z.object({
  note_type: z.enum(['general', 'allergy', 'preference', 'caution'], {
    errorMap: () => ({ message: "Please select a valid note type" }),
  }),
  content: z.string()
    .trim()
    .min(1, { message: "Note content cannot be empty" })
    .max(1000, { message: "Note must be less than 1000 characters" }),
});

export type ClientNoteData = z.infer<typeof clientNoteSchema>;

/**
 * Appointment Booking Schema
 */
export const appointmentSchema = z.object({
  stylist_id: z.string().uuid({ message: "Invalid stylist selected" }),
  service_id: z.string().uuid({ message: "Invalid service selected" }),
  appointment_date: z.date({
    required_error: "Please select an appointment date",
    invalid_type_error: "Invalid date format",
  }),
  notes: z.string()
    .trim()
    .max(500, { message: "Notes must be less than 500 characters" })
    .optional()
    .or(z.literal('')),
});

export type AppointmentData = z.infer<typeof appointmentSchema>;

/**
 * Review Schema
 */
export const reviewSchema = z.object({
  rating: z.number()
    .int({ message: "Rating must be a whole number" })
    .min(1, { message: "Rating must be at least 1 star" })
    .max(5, { message: "Rating cannot exceed 5 stars" }),
  comment: z.string()
    .trim()
    .min(10, { message: "Review must be at least 10 characters" })
    .max(1000, { message: "Review must be less than 1000 characters" }),
});

export type ReviewData = z.infer<typeof reviewSchema>;

/**
 * Sanitize HTML helper
 */
export const sanitizeHtml = (html: string): string => {
  // Remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '');
};

/**
 * Validate and encode URL parameters
 */
export const encodeUrlParam = (param: string): string => {
  return encodeURIComponent(param.trim().substring(0, 500));
};

/**
 * Validate file upload
 */
export const validateFileUpload = (file: File, options: {
  maxSizeMB?: number;
  allowedTypes?: string[];
} = {}) => {
  const maxSizeMB = options.maxSizeMB || 10;
  const allowedTypes = options.allowedTypes || ['image/jpeg', 'image/png', 'image/webp'];
  
  if (file.size > maxSizeMB * 1024 * 1024) {
    throw new Error(`File size must be less than ${maxSizeMB}MB`);
  }
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`File type must be one of: ${allowedTypes.join(', ')}`);
  }
  
  return true;
};

/**
 * Additional validation schemas for complex forms
 */

// Client creation with all fields
export const clientCreateSchema = z.object({
  full_name: commonValidators.name,
  email: commonValidators.email,
  phone: commonValidators.phone,
  hair_type: z.string().max(50).optional().or(z.literal('')),
  allergies: z.string().max(500).optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
  special_requests: z.string().max(500).optional().or(z.literal('')),
  hair_goals: z.string().max(500).optional().or(z.literal('')),
  sensitivity_notes: z.string().max(500).optional().or(z.literal(''))
});

export type ClientCreateData = z.infer<typeof clientCreateSchema>;

// AI prompt validation
export const aiPromptSchema = z.object({
  prompt: z.string()
    .trim()
    .min(3, { message: "Prompt must be at least 3 characters" })
    .max(2000, { message: "Prompt must be less than 2000 characters" }),
  context: z.record(z.unknown()).optional()
});

export type AIPromptData = z.infer<typeof aiPromptSchema>;

// Search query validation
export const searchQuerySchema = z.object({
  query: z.string()
    .trim()
    .max(200, { message: "Search query must be less than 200 characters" }),
  filters: z.object({
    dateFrom: z.date().optional(),
    dateTo: z.date().optional(),
    category: z.string().max(50).optional(),
    status: z.string().max(20).optional()
  }).optional()
});

export type SearchQueryData = z.infer<typeof searchQuerySchema>;

// Password change schema
export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required" }),
  newPassword: commonValidators.password,
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export type PasswordChangeData = z.infer<typeof passwordChangeSchema>;

/**
 * Validate and sanitize external URLs
 */
export const sanitizeExternalUrl = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
};

/**
 * Deep sanitize object (removes undefined, null, empty strings)
 */
export const sanitizeObject = <T extends Record<string, any>>(obj: T): Partial<T> => {
  const result: any = {};
  for (const key in obj) {
    const value = obj[key];
    if (value !== undefined && value !== null && value !== '') {
      result[key] = value;
    }
  }
  return result;
};

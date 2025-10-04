/**
 * Form Validation Schemas using Zod
 * Provides reusable validation for common form inputs
 */

import { z } from 'zod';

// ============= Basic Field Schemas =============

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(255, 'Email must be less than 255 characters');

export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(100, 'Password must be less than 100 characters');

export const phoneSchema = z
  .string()
  .trim()
  .optional()
  .refine(
    (val) => !val || /^\+?[\d\s\-\(\)]{10,20}$/.test(val),
    'Please enter a valid phone number (10-20 digits)'
  );

export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name must be less than 100 characters')
  .trim();

export const urlSchema = z
  .string()
  .trim()
  .optional()
  .refine(
    (val) => {
      if (!val) return true;
      try {
        const url = new URL(val);
        return ['http:', 'https:'].includes(url.protocol);
      } catch {
        return false;
      }
    },
    'Please enter a valid URL starting with http:// or https://'
  );

// ============= Authentication Schemas =============

export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: nameSchema,
  userType: z.enum(['stylist', 'client']),
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
});

export const updatePasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// Combined auth schema for flexible validation
export const authSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: nameSchema.optional(),
  userType: z.enum(['stylist', 'client']).optional(),
});

// ============= Profile Schemas =============

export const profileSchema = z.object({
  fullName: nameSchema,
  phone: phoneSchema,
  email: emailSchema,
});

export const stylistProfileSchema = z.object({
  businessName: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  specialty: z.string().max(100).optional(),
  location: z.string().max(200).optional(),
  yearsExperience: z.number().min(0).max(100).optional(),
  colorLine: z.string().max(100).optional(),
});

export const clientProfileSchema = z.object({
  fullName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  hairType: z.string().max(100).optional(),
  allergies: z.string().trim().max(500, 'Allergies must be less than 500 characters').optional(),
  notes: z.string().trim().max(1000, 'Notes must be less than 1000 characters').optional(),
  medicalInfoConsent: z.boolean().optional(),
});

// ============= Invitation Schemas =============

export const invitationSchema = z.object({
  email: emailSchema,
  customMessage: z.string().trim().max(500, 'Message must be less than 500 characters').optional(),
});

// ============= Appointment Schemas =============

export const appointmentSchema = z.object({
  stylistId: z.string().uuid('Invalid stylist ID'),
  clientId: z.string().uuid('Invalid client ID'),
  serviceId: z.string().uuid('Invalid service ID').optional(),
  serviceType: z.string().min(1, 'Service type is required'),
  appointmentDate: z.string().min(1, 'Date is required'),
  durationMinutes: z.number().min(15).max(480),
  notes: z.string().max(500).optional(),
});

export const serviceSchema = z.object({
  serviceName: z.string().min(1, 'Service name is required').max(100),
  description: z.string().max(500).optional(),
  price: z.number().min(0, 'Price must be positive'),
  durationMinutes: z.number().min(15, 'Minimum 15 minutes').max(480, 'Maximum 8 hours'),
  requireDeposit: z.boolean().optional(),
  depositAmount: z.number().min(0).optional(),
  depositType: z.enum(['fixed', 'percentage']).optional(),
});

// ============= Formula Schemas =============

export const formulaSchema = z.object({
  clientId: z.string().uuid('Invalid client ID'),
  formulaText: z.string().min(1, 'Formula is required').max(1000),
  instructions: z.string().max(1000).optional(),
  colorLine: z.string().max(100).optional(),
  resultNotes: z.string().max(500).optional(),
});

// ============= Message Schemas =============

export const messageSchema = z.object({
  recipientId: z.string().uuid('Invalid recipient ID'),
  messageText: z.string().min(1, 'Message is required').max(1000),
});

// ============= Review Schemas =============

export const reviewSchema = z.object({
  stylistId: z.string().uuid('Invalid stylist ID'),
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5').int('Rating must be a whole number'),
  reviewText: z.string().trim().max(1000, 'Review must be less than 1000 characters').optional(),
  appointmentId: z.string().uuid().optional(),
});

// ============= Security Validation =============

/**
 * Sanitizes user input by removing potentially dangerous characters
 * Use this before displaying user-generated content
 */
export const sanitizeText = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove HTML brackets
    .replace(/javascript:/gi, '') // Remove javascript protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Validates that a string doesn't contain SQL injection patterns
 */
export const hasSQLInjection = (input: string): boolean => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(--|\;|\/\*|\*\/|xp_)/i,
    /(\bOR\b.*=.*|1\s*=\s*1)/i,
  ];
  return sqlPatterns.some(pattern => pattern.test(input));
};

/**
 * Validates UUID format
 */
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// ============= Helper Functions =============

/**
 * Validates data against a schema and returns formatted errors
 */
export function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  result.error.errors.forEach((error) => {
    const path = error.path.join('.');
    errors[path] = error.message;
  });

  return { success: false, errors };
}

/**
 * Creates a validation function for use with useFormState hook
 */
export function createValidator<T>(schema: z.ZodSchema<T>) {
  return (values: unknown): Record<string, string> => {
    const result = schema.safeParse(values);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((error) => {
        const path = error.path.join('.');
        errors[path] = error.message;
      });
      return errors;
    }
    return {};
  };
}

// ============= Type Exports =============

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type StylistProfileInput = z.infer<typeof stylistProfileSchema>;
export type ClientProfileInput = z.infer<typeof clientProfileSchema>;
export type AppointmentInput = z.infer<typeof appointmentSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type FormulaInput = z.infer<typeof formulaSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type InvitationInput = z.infer<typeof invitationSchema>;

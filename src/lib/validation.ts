/**
 * Form Validation Schemas using Zod
 * Provides reusable validation for common form inputs
 */

import { z } from 'zod';

// ============= Basic Field Schemas =============

export const emailSchema = z
  .string()
  .trim()
  .email('Invalid email address')
  .max(255, 'Email must be less than 255 characters')
  .optional()
  .or(z.literal(''));

export const requiredEmailSchema = z
  .string()
  .trim()
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
  .max(20, 'Phone must be less than 20 characters')
  .regex(/^[\d\s\-+()]+$/, { message: 'Please enter a valid phone number' })
  .optional()
  .or(z.literal(''));

export const nameSchema = z
  .string()
  .trim()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be less than 100 characters')
  .regex(/^[a-zA-Z\s\-.']+$/, {
    message:
      'Name can only contain letters, spaces, hyphens, periods, and apostrophes',
  });

// Helper for creating textarea schemas with custom max length
export const textareaSchema = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength, `Must be less than ${maxLength} characters`)
    .optional()
    .or(z.literal(''));

export const currencySchema = z
  .number()
  .min(0, 'Price must be positive')
  .max(10000, 'Price cannot exceed $10,000');

export const durationSchema = z
  .number()
  .int()
  .min(15, 'Duration must be at least 15 minutes')
  .max(480, 'Duration must be less than 8 hours');

export const urlSchema = z
  .string()
  .trim()
  .optional()
  .refine(val => {
    if (!val) return true;
    try {
      const url = new URL(val);
      return ['http:', 'https:'].includes(url.protocol);
    } catch {
      return false;
    }
  }, 'Please enter a valid URL starting with http:// or https://');

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
  .refine(data => data.newPassword === data.confirmPassword, {
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
  allergies: textareaSchema(500),
  notes: textareaSchema(1000),
  medicalInfoConsent: z.boolean().optional(),
});

// Simplified client schema for quick add forms
export const clientSchema = z.object({
  full_name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  hair_type: z
    .string()
    .trim()
    .max(100, 'Hair type must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  notes: textareaSchema(500),
  allergies: textareaSchema(500),
  medical_info_consent: z.boolean().optional(),
});

// ============= Invitation Schemas =============

export const invitationSchema = z.object({
  clientEmail: requiredEmailSchema,
  customMessage: textareaSchema(500),
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

export const serviceSchema = z
  .object({
    service_name: z.string().min(1, 'Service name required').max(100),
    description: textareaSchema(500),
    price: currencySchema,
    duration_minutes: durationSchema,
    is_active: z.boolean().optional(),
    require_deposit: z.boolean().optional(),
    deposit_amount: z.number().min(0).optional(),
    deposit_type: z.enum(['fixed', 'percentage']).optional(),
    buffer_time_minutes: z.number().int().min(0).max(120).optional(),
  })
  .refine(
    data =>
      !data.require_deposit || (data.deposit_amount && data.deposit_amount > 0),
    {
      message: 'Deposit amount required when deposit is enabled',
      path: ['deposit_amount'],
    }
  )
  .refine(
    data => {
      if (
        data.require_deposit &&
        data.deposit_type === 'percentage' &&
        data.deposit_amount
      ) {
        return data.deposit_amount <= 100;
      }
      return true;
    },
    { message: 'Percentage must be 100 or less', path: ['deposit_amount'] }
  );

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
  rating: z
    .number()
    .int()
    .min(1, 'Rating required')
    .max(5, 'Rating must be 5 or less'),
  review_text: z
    .string()
    .trim()
    .min(10, 'Review must be at least 10 characters')
    .max(500, 'Review must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  appointment_id: z.string().uuid().optional(),
});

// ============= Password Change Schema =============

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm password required'),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

// ============= Reschedule Schema =============

export const rescheduleSchema = z.object({
  appointment_id: z.string().uuid('Valid appointment ID required'),
  new_date: z.string().min(1, 'New date required'),
  new_time: z.string().min(1, 'New time required'),
  reason: textareaSchema(500),
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
    /(--|\/\*|\*\/|xp_)/i,
    /(\bOR\b.*=.*|1\s*=\s*1)/i,
    /;\s*(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)/i,
  ];
  return sqlPatterns.some(pattern => pattern.test(input));
};

/**
 * Validates UUID format
 */
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// ============= Helper Functions =============

/**
 * Validates data against a schema and returns formatted errors
 */
export function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
):
  | { success: true; data: T }
  | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  result.error.errors.forEach(error => {
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
      result.error.errors.forEach(error => {
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
export type ClientInput = z.infer<typeof clientSchema>;
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;
export type RescheduleInput = z.infer<typeof rescheduleSchema>;

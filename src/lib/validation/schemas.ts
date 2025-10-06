/**
 * Centralized Validation Schemas
 * 
 * Uses Zod for type-safe validation across all forms.
 * Provides consistent error messages and validation rules.
 */

import { z } from "zod";

/**
 * Common field validations
 */
export const commonSchemas = {
  email: z
    .string()
    .email("Hmm, that email doesn't look quite right 📧")
    .max(255, "Email's too long - keep it under 255 characters ✂️")
    .optional()
    .or(z.literal("")),

  phone: z
    .string()
    .regex(
      /^[\d\s\-\(\)]+$/,
      "Phone number can only contain numbers, spaces, and - ( )"
    )
    .min(10, "Phone number seems a bit short 📱")
    .max(20, "Phone number seems a bit long 📱")
    .optional()
    .or(z.literal("")),

  name: z
    .string()
    .trim()
    .min(1, "We'd love to know the name! 👤")
    .max(100, "That name's a bit long - keep it under 100 characters 📝"),

  notes: z
    .string()
    .max(1000, "Notes are a bit lengthy - keep it under 1000 characters 📝")
    .optional()
    .or(z.literal("")),

  shortText: z
    .string()
    .max(255, "Keep it under 255 characters please ✂️")
    .optional()
    .or(z.literal("")),

  longText: z
    .string()
    .max(2000, "That's a bit too long - keep it under 2000 characters 📝")
    .optional()
    .or(z.literal("")),
};

/**
 * Client Profile Schema
 */
export const clientProfileSchema = z.object({
  full_name: commonSchemas.name,
  email: commonSchemas.email,
  phone: commonSchemas.phone,
  hair_type: commonSchemas.shortText,
  allergies: z
    .string()
    .max(500, "Allergies field is too long - keep it under 500 characters ✂️")
    .optional()
    .or(z.literal("")),
  notes: commonSchemas.notes,
});

export type ClientProfileFormData = z.infer<typeof clientProfileSchema>;

/**
 * Stylist Profile Schema
 */
export const stylistProfileSchema = z.object({
  business_name: commonSchemas.name.optional(),
  bio: commonSchemas.longText,
  color_line: commonSchemas.shortText,
  specialty: commonSchemas.shortText,
  location: commonSchemas.shortText,
  years_experience: z
    .number()
    .int()
    .min(0, "Years of experience can't be negative")
    .max(100, "That's quite a career! 👴")
    .optional(),
});

export type StylistProfileFormData = z.infer<typeof stylistProfileSchema>;

/**
 * Formula Schema
 */
export const formulaSchema = z.object({
  client_id: z.string().uuid("Please select a client"),
  formula_text: z
    .string()
    .trim()
    .min(1, "Formula can't be empty! ✨")
    .max(2000, "Formula is too long - keep it under 2000 characters 📝"),
  instructions: commonSchemas.longText,
  color_line: commonSchemas.shortText,
  result_notes: commonSchemas.notes,
});

export type FormulaFormData = z.infer<typeof formulaSchema>;

/**
 * Appointment Schema
 */
export const appointmentSchema = z.object({
  client_id: z.string().uuid("Please select a client"),
  service_type: z.string().min(1, "Please select a service type"),
  appointment_date: z.date({
    required_error: "Please select a date and time",
    invalid_type_error: "Invalid date format",
  }),
  duration_minutes: z
    .number()
    .int()
    .min(15, "Minimum appointment duration is 15 minutes")
    .max(480, "Maximum appointment duration is 8 hours"),
  notes: commonSchemas.notes,
});

export type AppointmentFormData = z.infer<typeof appointmentSchema>;

/**
 * Message Schema
 */
export const messageSchema = z.object({
  message_text: z
    .string()
    .trim()
    .min(1, "Message can't be empty")
    .max(1000, "Message is too long - keep it under 1000 characters"),
});

export type MessageFormData = z.infer<typeof messageSchema>;

/**
 * Review Schema
 */
export const reviewSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, "Please select a rating")
    .max(5, "Maximum rating is 5 stars"),
  review_text: z
    .string()
    .min(10, "Please write at least 10 characters")
    .max(1000, "Review is too long - keep it under 1000 characters")
    .optional()
    .or(z.literal("")),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;

/**
 * Helper to get user-friendly error messages
 */
export const getFormErrors = (error: z.ZodError): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  error.errors.forEach((err) => {
    const field = err.path.join(".");
    errors[field] = err.message;
  });

  return errors;
};

/**
 * Helper to validate form data
 */
export const validateForm = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } => {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, errors: getFormErrors(result.error) };
  }
};

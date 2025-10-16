/**
 * Client Validation Schemas  
 * Comprehensive validation for client management
 */

import { z } from "zod";

const phoneRegex = /^[\d\s\-\+\(\)]+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const clientSchema = z.object({
  full_name: z.string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name must be less than 100 characters" }),
  email: z.string()
    .trim()
    .max(255, { message: "Email must be less than 255 characters" })
    .refine((email) => !email || emailRegex.test(email), {
      message: "Invalid email format"
    })
    .optional()
    .nullable(),
  phone: z.string()
    .trim()
    .max(20, { message: "Phone must be less than 20 characters" })
    .refine((phone) => !phone || phoneRegex.test(phone), {
      message: "Invalid phone format - use only digits, spaces, and +-() characters"
    })
    .optional()
    .nullable(),
  hair_type: z.string()
    .trim()
    .max(100, { message: "Hair type must be less than 100 characters" })
    .optional()
    .nullable(),
  allergies: z.string()
    .trim()
    .max(500, { message: "Allergies must be less than 500 characters" })
    .optional()
    .nullable(),
  notes: z.string()
    .trim()
    .max(2000, { message: "Notes must be less than 2000 characters" })
    .optional()
    .nullable(),
  preferred_stylist_id: z.string().uuid().optional().nullable()
});

export type ClientInput = z.infer<typeof clientSchema>;

export const clientInviteSchema = z.object({
  email: z.string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  message: z.string()
    .trim()
    .max(500, { message: "Message must be less than 500 characters" })
    .optional()
});

export type ClientInviteInput = z.infer<typeof clientInviteSchema>;
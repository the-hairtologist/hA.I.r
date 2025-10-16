/**
 * Appointment Validation Schemas
 * Comprehensive validation for appointment management
 */

import { z } from "zod";

export const appointmentSchema = z.object({
  client_id: z.string().uuid({ message: "Valid client selection required" }),
  stylist_id: z.string().uuid({ message: "Valid stylist selection required" }),
  appointment_date: z.string().refine(
    (date) => {
      const appointmentDate = new Date(date);
      const now = new Date();
      return appointmentDate > now;
    },
    { message: "Appointment must be in the future" }
  ),
  service_type: z.string()
    .trim()
    .min(1, { message: "Service type required" })
    .max(200, { message: "Service type must be less than 200 characters" }),
  duration_minutes: z.number()
    .int()
    .min(15, { message: "Duration must be at least 15 minutes" })
    .max(480, { message: "Duration must be less than 8 hours" })
    .optional(),
  notes: z.string()
    .trim()
    .max(1000, { message: "Notes must be less than 1000 characters" })
    .optional(),
  status: z.enum(["scheduled", "confirmed", "completed", "cancelled", "no-show"], {
    errorMap: () => ({ message: "Invalid appointment status" })
  }).optional()
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;

export const rescheduleSchema = z.object({
  appointment_id: z.string().uuid({ message: "Valid appointment ID required" }),
  new_date: z.string().refine(
    (date) => {
      const appointmentDate = new Date(date);
      const now = new Date();
      return appointmentDate > now;
    },
    { message: "New appointment date must be in the future" }
  ),
  reason: z.string()
    .trim()
    .max(500, { message: "Reason must be less than 500 characters" })
    .optional()
});

export type RescheduleInput = z.infer<typeof rescheduleSchema>;
/**
 * Formula Validation Schemas
 * Comprehensive client and server-side validation for formula creation
 */

import { z } from "zod";

export const formulaSchema = z.object({
  client_id: z.string().uuid({ message: "Valid client selection required" }),
  formula_text: z.string()
    .trim()
    .min(10, { message: "Formula must be at least 10 characters" })
    .max(5000, { message: "Formula must be less than 5000 characters" }),
  instructions: z.string()
    .trim()
    .max(2000, { message: "Instructions must be less than 2000 characters" })
    .optional(),
  color_line: z.string()
    .trim()
    .max(100, { message: "Color line must be less than 100 characters" })
    .optional(),
  result_notes: z.string()
    .trim()
    .max(1000, { message: "Result notes must be less than 1000 characters" })
    .optional(),
  processing_time_minutes: z.number()
    .int()
    .min(1, { message: "Processing time must be at least 1 minute" })
    .max(480, { message: "Processing time must be less than 8 hours" })
    .optional()
    .nullable(),
  developer_volume: z.string()
    .trim()
    .max(50, { message: "Developer volume must be less than 50 characters" })
    .optional(),
  application_notes: z.string()
    .trim()
    .max(1000, { message: "Application notes must be less than 1000 characters" })
    .optional(),
  what_worked: z.string()
    .trim()
    .max(1000, { message: "What worked must be less than 1000 characters" })
    .optional(),
  what_to_avoid: z.string()
    .trim()
    .max(1000, { message: "What to avoid must be less than 1000 characters" })
    .optional(),
  tags: z.array(z.string().trim().max(50)).max(10, { message: "Maximum 10 tags allowed" }).optional()
});

export type FormulaInput = z.infer<typeof formulaSchema>;

export const quickFormulaSchema = z.object({
  currentLevel: z.string().min(1, { message: "Current level required" }),
  targetLevel: z.string().min(1, { message: "Target level required" }),
  tone: z.string().min(1, { message: "Tone required" }),
  condition: z.string().min(1, { message: "Condition required" })
});

export type QuickFormulaInput = z.infer<typeof quickFormulaSchema>;
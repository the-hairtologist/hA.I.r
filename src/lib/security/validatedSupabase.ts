/**
 * Validated Supabase Operations
 * Enforces Zod validation on all database operations for security
 */

import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logging/productionLogger';

/**
 * Validates data before insert operation
 */
export async function validatedInsert<T extends z.ZodTypeAny>(
  table: string,
  schema: T,
  data: z.infer<T> | z.infer<T>[]
) {
  try {
    // Validate single or array of data
    const validatedData = Array.isArray(data)
      ? data.map(item => schema.parse(item))
      : schema.parse(data);

    const { data: result, error } = await supabase
      .from(table as any)
      .insert(validatedData as any)
      .select();

    if (error) throw error;

    logger.info('Validated insert successful', {
      context: 'validatedSupabase',
      table,
      count: Array.isArray(result) ? result.length : 1,
    });

    return { data: result, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Validation failed on insert', error, {
        context: 'validatedSupabase',
        table,
        validationErrors: error.issues,
      });
      return {
        data: null,
        error: new Error(
          `Validation failed: ${error.issues.map(e => e.message).join(', ')}`
        ),
      };
    }

    logger.error('Insert operation failed', error, {
      context: 'validatedSupabase',
      table,
    });

    return { data: null, error };
  }
}

/**
 * Validates data before update operation
 */
export async function validatedUpdate<T extends z.ZodTypeAny>(
  table: string,
  schema: T,
  data: Partial<z.infer<T>>,
  matcher: { column: string; value: any }
) {
  try {
    // Use partial schema for updates (all fields optional)
    const partialSchema = (schema as any).partial
      ? (schema as any).partial()
      : schema;
    const validatedData = partialSchema.parse(data);

    const { data: result, error } = await supabase
      .from(table as any)
      .update(validatedData as any)
      .eq(matcher.column, matcher.value)
      .select();

    if (error) throw error;

    logger.info('Validated update successful', {
      context: 'validatedSupabase',
      table,
      matcher,
    });

    return { data: result, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Validation failed on update', error, {
        context: 'validatedSupabase',
        table,
        validationErrors: error.issues,
      });
      return {
        data: null,
        error: new Error(
          `Validation failed: ${error.issues.map(e => e.message).join(', ')}`
        ),
      };
    }

    logger.error('Update operation failed', error, {
      context: 'validatedSupabase',
      table,
    });

    return { data: null, error };
  }
}

/**
 * Common validation schemas for reuse
 */
export const ValidationSchemas = {
  appointment: z.object({
    stylist_id: z.string().uuid(),
    client_id: z.string().uuid(),
    appointment_date: z.string(),
    duration_minutes: z.number().int().min(15).max(480),
    status: z
      .enum([
        'scheduled',
        'confirmed',
        'in_progress',
        'completed',
        'cancelled',
        'no_show',
      ])
      .optional(),
    notes: z.string().max(500).optional(),
    service_type: z.string().max(100).optional(),
  }),

  clientProfile: z.object({
    user_id: z.string().uuid(),
    full_name: z.string().min(2).max(100),
    email: z.string().email().max(255).optional(),
    phone: z.string().max(20).optional(),
    hair_type: z.string().max(100).optional(),
    allergies: z.string().max(500).optional(),
    notes: z.string().max(1000).optional(),
    medical_info_consent: z.boolean().optional(),
    preferred_stylist_id: z.string().uuid().optional(),
  }),

  review: z.object({
    stylist_id: z.string().uuid(),
    client_id: z.string().uuid(),
    appointment_id: z.string().uuid().optional(),
    rating: z.number().int().min(1).max(5),
    review_text: z.string().min(10).max(500).optional(),
  }),

  formula: z.object({
    stylist_id: z.string().uuid(),
    client_id: z.string().uuid(),
    formula_name: z.string().max(100).optional(),
    formula_text: z.string().min(1).max(1000),
    instructions: z.string().max(1000).optional(),
    color_line: z.string().max(100).optional(),
    result_notes: z.string().max(500).optional(),
  }),

  bugReport: z.object({
    user_id: z.string().uuid().optional(),
    description: z.string().min(10).max(1000),
    steps_to_reproduce: z.string().max(1000).optional(),
    expected_behavior: z.string().max(500).optional(),
    severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    page_url: z.string().url().optional(),
    user_agent: z.string().max(500).optional(),
  }),
};

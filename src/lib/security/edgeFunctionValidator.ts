/**
 * Edge Function Security Validator
 * Ensures all edge function calls include proper authentication and role validation
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logging/productionLogger';
import { z } from 'zod';

interface EdgeFunctionCallOptions {
  functionName: string;
  body?: Record<string, any>;
  requireAuth?: boolean;
  requireRole?: 'admin' | 'stylist' | 'client';
  bodySchema?: z.ZodSchema;
}

/**
 * Securely invoke edge function with validation
 */
export async function secureEdgeFunctionCall<T = any>(
  options: EdgeFunctionCallOptions
): Promise<{ data: T | null; error: Error | null }> {
  const {
    functionName,
    body,
    requireAuth = true,
    requireRole,
    bodySchema,
  } = options;

  try {
    // 1. Check authentication if required
    if (requireAuth) {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error('Authentication required');
      }

      // 2. Check role if specified
      if (requireRole) {
        const { data: userRoles, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id);

        if (roleError) {
          throw new Error('Failed to verify user role');
        }

        const hasRole = userRoles?.some(r => r.role === requireRole);
        if (!hasRole) {
          throw new Error(`Requires ${requireRole} role`);
        }
      }
    }

    // 3. Validate body if schema provided
    let validatedBody: Record<string, any> | undefined = body;
    if (bodySchema && body) {
      try {
        validatedBody = bodySchema.parse(body) as Record<string, any>;
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new Error(
            `Invalid request body: ${error.issues.map((e: any) => e.message).join(', ')}`
          );
        }
        throw error;
      }
    }

    // 4. Call edge function
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: validatedBody,
    });

    if (error) throw error;

    logger.info('Edge function called successfully', {
      context: 'secureEdgeFunctionCall',
      functionName,
      hasBody: !!body,
    });

    return { data, error: null };
  } catch (error) {
    logger.error('Edge function call failed', error, {
      context: 'secureEdgeFunctionCall',
      functionName,
      requireAuth,
      requireRole,
    });

    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Common edge function body schemas
 */
export const EdgeFunctionSchemas = {
  sendEmail: z.object({
    to: z.string().email(),
    subject: z.string().max(200),
    body: z.string().max(10000),
  }),

  sendSMS: z.object({
    to: z.string().max(20),
    message: z.string().max(1600),
  }),

  appointmentReminder: z.object({
    appointmentId: z.string().uuid(),
    customMessage: z.string().max(500).optional(),
  }),

  aiFormulaSuggestion: z.object({
    clientId: z.string().uuid(),
    hairType: z.string().max(100),
    desiredResult: z.string().max(500),
    allergies: z.string().max(500).optional(),
  }),
};

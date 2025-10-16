/**
 * Centralized Error Handling for Edge Functions
 * Provides consistent error responses and logging
 */

import { corsHeaders } from './compression.ts';

export interface ErrorResponse {
  error: string;
  code?: string;
  details?: any;
  timestamp: string;
}

/**
 * Create standardized error response
 */
export function createErrorResponse(
  error: Error | string,
  status = 500,
  code?: string,
  details?: any
): Response {
  const message = error instanceof Error ? error.message : error;
  
  const errorResponse: ErrorResponse = {
    error: message,
    code,
    details,
    timestamp: new Date().toISOString()
  };

  // Log error for monitoring (don't expose sensitive info)
  console.error('Edge Function Error:', {
    message,
    code,
    status,
    timestamp: errorResponse.timestamp
  });

  return new Response(
    JSON.stringify(errorResponse),
    {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

/**
 * Handle common error types with appropriate status codes
 */
export function handleError(error: any): Response {
  // Authentication errors
  if (error.message?.includes('Missing authorization') || 
      error.message?.includes('Unauthorized')) {
    return createErrorResponse(error, 401, 'UNAUTHORIZED');
  }

  // Authorization errors
  if (error.message?.includes('Forbidden') || 
      error.message?.includes('role required')) {
    return createErrorResponse(error, 403, 'FORBIDDEN');
  }

  // Rate limiting
  if (error.message?.includes('rate limit') || error.status === 429) {
    return createErrorResponse(
      'Rate limit exceeded. Please try again later.',
      429,
      'RATE_LIMITED'
    );
  }

  // Payment required (AI credits)
  if (error.status === 402 || error.message?.includes('credits')) {
    return createErrorResponse(
      'AI usage limit reached. Please add credits to continue.',
      402,
      'PAYMENT_REQUIRED'
    );
  }

  // Validation errors
  if (error.message?.includes('Invalid') || 
      error.message?.includes('validation')) {
    return createErrorResponse(error, 400, 'VALIDATION_ERROR');
  }

  // Not found errors
  if (error.message?.includes('not found') || error.status === 404) {
    return createErrorResponse(error, 404, 'NOT_FOUND');
  }

  // Default server error
  return createErrorResponse(
    'An unexpected error occurred. Please try again.',
    500,
    'INTERNAL_ERROR',
    { originalError: error.message }
  );
}

/**
 * Validate request body
 */
export function validateRequestBody(body: any, requiredFields: string[]): void {
  if (!body) {
    throw new Error('Request body is required');
  }

  for (const field of requiredFields) {
    if (body[field] === undefined || body[field] === null) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
}

/**
 * Rate limiting helper
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  userId: string,
  maxRequests: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (userLimit.count >= maxRequests) {
    return false;
  }

  userLimit.count++;
  return true;
}

/**
 * Phone Number Validation Utility
 * Validates phone numbers using E.164 international format
 */

import { z } from 'zod';

export const phoneSchema = z
  .string()
  .regex(
    /^\+?[1-9]\d{1,14}$/,
    "Please enter a valid phone number (e.g., +1234567890)"
  )
  .optional()
  .or(z.literal(''));

export const validatePhone = (
  phone: string
): { valid: boolean; error?: string } => {
  if (!phone || phone.trim() === '') {
    return { valid: true }; // Empty is valid (optional)
  }

  try {
    phoneSchema.parse(phone);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.errors[0].message };
    }
    return { valid: false, error: 'Invalid phone number' };
  }
};

export const formatPhoneDisplay = (phone: string): string => {
  // Basic formatting for display (US format)
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phone; // Return as-is if not standard format
};

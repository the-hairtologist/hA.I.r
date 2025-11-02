/**
 * Authentication API Layer
 * Centralized auth operations with Google OAuth support
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logging/productionLogger';
import { userJourney } from '@/lib/logging/userJourneyTracker';

export interface SignUpData {
  email: string;
  password: string;
  full_name?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

/**
 * Sign up with email/password
 */
export const signUp = async ({ email, password, full_name }: SignUpData) => {
  try {
    const redirectUrl = `${window.location.origin}/dashboard`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: full_name || null,
        },
      },
    });

    if (error) throw error;

    logger.info('User signed up', {
      context: 'AuthAPI.signUp',
      email,
      userId: data.user?.id,
    });

    userJourney.trackAction('User signed up', { email, method: 'email' });

    return { data, error: null };
  } catch (error) {
    logger.error('Sign up failed', error, { context: 'AuthAPI.signUp', email });
    return { data: null, error };
  }
};

/**
 * Sign in with email/password
 */
export const signIn = async ({ email, password }: SignInData) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    logger.info('User signed in', {
      context: 'AuthAPI.signIn',
      email,
      userId: data.user?.id,
    });

    userJourney.trackAction('User signed in', { email, method: 'email' });

    return { data, error: null };
  } catch (error) {
    logger.error('Sign in failed', error, { context: 'AuthAPI.signIn', email });
    return { data: null, error };
  }
};

/**
 * Sign in with Google OAuth
 */
export const signInWithGoogle = async () => {
  try {
    const redirectUrl = `${window.location.origin}/dashboard`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) throw error;

    logger.info('Google OAuth initiated', {
      context: 'AuthAPI.signInWithGoogle',
    });
    userJourney.trackAction('User initiated Google sign-in', {
      method: 'google',
    });

    return { data, error: null };
  } catch (error) {
    logger.error('Google OAuth failed', error, {
      context: 'AuthAPI.signInWithGoogle',
    });
    return { data: null, error };
  }
};

/**
 * Sign out
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    logger.info('User signed out', { context: 'AuthAPI.signOut' });
    userJourney.trackAction('User signed out');

    return { error: null };
  } catch (error) {
    logger.error('Sign out failed', error, { context: 'AuthAPI.signOut' });
    return { error };
  }
};

/**
 * Get current session
 */
export const getCurrentSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) throw error;

    return { data: data.session, error: null };
  } catch (error) {
    logger.error('Get session failed', error, {
      context: 'AuthAPI.getSession',
    });
    return { data: null, error };
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) throw error;

    return { data: data.user, error: null };
  } catch (error) {
    logger.error('Get user failed', error, { context: 'AuthAPI.getUser' });
    return { data: null, error };
  }
};

/**
 * Refresh session
 */
export const refreshSession = async () => {
  try {
    const { data, error } = await supabase.auth.refreshSession();

    if (error) throw error;

    logger.info('Session refreshed', { context: 'AuthAPI.refreshSession' });

    return { data: data.session, error: null };
  } catch (error) {
    logger.error('Session refresh failed', error, {
      context: 'AuthAPI.refreshSession',
    });
    return { data: null, error };
  }
};

/**
 * Reset password (send email)
 */
export const resetPassword = async (email: string) => {
  try {
    const redirectUrl = `${window.location.origin}/auth?mode=reset`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) throw error;

    logger.info('Password reset email sent', {
      context: 'AuthAPI.resetPassword',
      email,
    });
    userJourney.trackAction('Password reset requested', { email });

    return { error: null };
  } catch (error) {
    logger.error('Password reset failed', error, {
      context: 'AuthAPI.resetPassword',
      email,
    });
    return { error };
  }
};

/**
 * Update password
 */
export const updatePassword = async (newPassword: string) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;

    logger.info('Password updated', { context: 'AuthAPI.updatePassword' });
    userJourney.trackAction('Password updated');

    return { error: null };
  } catch (error) {
    logger.error('Password update failed', error, {
      context: 'AuthAPI.updatePassword',
    });
    return { error };
  }
};

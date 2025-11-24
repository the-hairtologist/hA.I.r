/**
 * Enhanced Authentication Hook
 * Provides centralized authentication state and methods
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { handleError } from '@/lib/errorHandler';
import { logger } from '@/lib/logging/productionLogger';
import { userJourney } from '@/lib/logging/userJourneyTracker';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
}

interface UseAuthReturn extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const navigate = useNavigate();
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      logger.debug('Auth state changed', {
        component: 'useAuth',
        event,
        userId: session?.user?.id,
      });

      // Track auth events in user journey
      userJourney.trackAction(`Auth: ${event}`, {
        userId: session?.user?.id,
        email: session?.user?.email,
      });

      // CRITICAL: Only synchronous state updates in callback
      setState({
        user: session?.user ?? null,
        session: session,
        loading: false,
        isAuthenticated: !!session,
      });

      // CRITICAL FIX: Only navigate on actual sign-in/sign-out events, NOT initial session load
      // Defer navigation with setTimeout to prevent deadlocks
      if (event === 'SIGNED_IN') {
        setTimeout(() => {
          // Only navigate if we're currently on auth page
          if (window.location.pathname === '/auth') {
            navigate('/dashboard');
          }
        }, 0);
      } else if (event === 'SIGNED_OUT') {
        setTimeout(() => navigate('/auth'), 0);
      } else if (event === 'TOKEN_REFRESHED') {
        logger.info('Token refreshed successfully', { component: 'useAuth' });
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({
        user: session?.user ?? null,
        session: session,
        loading: false,
        isAuthenticated: !!session,
      });
    });

    // Supabase automatically handles token refresh
    // The client is configured with autoRefreshToken: true by default
    // Manual refresh is only needed in edge cases
    // Commenting out aggressive refresh logic to prevent unexpected logouts

    // Optional: Set up session validation (less aggressive than refresh)
    const sessionCheckInterval = setInterval(
      async () => {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          logger.warn('Session check failed', {
            component: 'useAuth',
            error: error.message,
          });
          // Don't force logout on network errors - let Supabase handle it
          return;
        }

        // Only log if session is about to expire (within 10 minutes)
        if (session?.expires_at) {
          const expiresAt = session.expires_at * 1000;
          const now = Date.now();
          const tenMinutes = 10 * 60 * 1000;

          if (expiresAt - now < tenMinutes && expiresAt - now > 0) {
            logger.info('Session expiring soon - Supabase will auto-refresh', {
              component: 'useAuth',
              expiresIn: Math.floor((expiresAt - now) / 1000 / 60) + ' minutes',
            });
          }
        }
      },
      5 * 60 * 1000
    ); // Check every 5 minutes (less aggressive)

    return () => {
      subscription.unsubscribe();
      clearInterval(sessionCheckInterval);
    };
  }, [navigate]);

  const signIn = useCallback(async (email: string, password: string) => {
    const startTime = Date.now();
    try {
      logger.info('Attempting sign in', { component: 'useAuth', email });
      userJourney.trackAction('Sign In Attempt', { email });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const duration = Date.now() - startTime;
      logger.info('Sign in successful', {
        component: 'useAuth',
        userId: data.user?.id,
        duration,
      });
      logger.performance('Sign In', duration, { email });
      userJourney.trackAction('Sign In Success', { userId: data.user?.id });
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Sign in failed', error, {
        component: 'useAuth',
        email,
        duration,
      });
      userJourney.trackError(error as Error, { action: 'signIn', email });
      handleError(error, 'Sign In');
      throw error;
    }
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, fullName: string) => {
      const startTime = Date.now();
      try {
        logger.info('Attempting sign up', {
          component: 'useAuth',
          email,
          fullName,
        });
        userJourney.trackAction('Sign Up Attempt', { email, fullName });

        const redirectUrl = `${window.location.origin}/`;

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) throw error;

        const duration = Date.now() - startTime;
        logger.info('Sign up successful', {
          component: 'useAuth',
          userId: data.user?.id,
          duration,
        });
        logger.performance('Sign Up', duration, { email });
        userJourney.trackAction('Sign Up Success', { userId: data.user?.id });
      } catch (error) {
        const duration = Date.now() - startTime;
        logger.error('Sign up failed', error, {
          component: 'useAuth',
          email,
          duration,
        });
        userJourney.trackError(error as Error, { action: 'signUp', email });
        handleError(error, 'Sign Up');
        throw error;
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    try {
      logger.info('Attempting sign out', { component: 'useAuth' });
      userJourney.trackAction('Sign Out Attempt');

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      logger.info('Sign out successful', { component: 'useAuth' });
      userJourney.trackAction('Sign Out Success');
    } catch (error) {
      logger.error('Sign out failed', error, { component: 'useAuth' });
      userJourney.trackError(error as Error, { action: 'signOut' });
      handleError(error, 'Sign Out');
      throw error;
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      logger.info('Requesting password reset', { component: 'useAuth', email });
      userJourney.trackAction('Password Reset Request', { email });

      const redirectUrl = `${window.location.origin}/auth?mode=recovery`;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      logger.info('Password reset email sent', { component: 'useAuth', email });
      userJourney.trackAction('Password Reset Email Sent', { email });
    } catch (error) {
      logger.error('Password reset failed', error, {
        component: 'useAuth',
        email,
      });
      userJourney.trackError(error as Error, {
        action: 'resetPassword',
        email,
      });
      handleError(error, 'Password Reset');
      throw error;
    }
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    try {
      logger.info('Updating password', { component: 'useAuth' });
      userJourney.trackAction('Password Update Attempt');

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      logger.info('Password updated successfully', { component: 'useAuth' });
      userJourney.trackAction('Password Update Success');
    } catch (error) {
      logger.error('Password update failed', error, { component: 'useAuth' });
      userJourney.trackError(error as Error, { action: 'updatePassword' });
      handleError(error, 'Update Password');
      throw error;
    }
  }, []);

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  };
}

/**
 * Enhanced Authentication Hook
 * Provides centralized authentication state and methods
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { log } from '@/lib/logger';
import { handleError } from '@/lib/errorHandler';

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        log.debug('Auth state changed', 'useAuth', { event, userId: session?.user?.id });
        
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
          log.info('Token refreshed successfully', 'useAuth');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({
        user: session?.user ?? null,
        session: session,
        loading: false,
        isAuthenticated: !!session,
      });
    });

    // Set up automatic token refresh check
    const refreshInterval = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Check if token is about to expire (within 5 minutes)
        const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;
        
        if (expiresAt - now < fiveMinutes) {
          log.info('Token expiring soon, refreshing...', 'useAuth');
          const { error } = await supabase.auth.refreshSession();
          if (error) {
            log.error('Token refresh failed', 'useAuth', { error });
          }
        }
      }
    }, 60000); // Check every minute

    return () => {
      subscription.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, [navigate]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      log.info('Attempting sign in', 'useAuth', { email });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      log.info('Sign in successful', 'useAuth', { userId: data.user?.id });
    } catch (error) {
      handleError(error, 'Sign In');
      throw error;
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    try {
      log.info('Attempting sign up', 'useAuth', { email });
      
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

      log.info('Sign up successful', 'useAuth', { userId: data.user?.id });
    } catch (error) {
      handleError(error, 'Sign Up');
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      log.info('Attempting sign out', 'useAuth');
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      log.info('Sign out successful', 'useAuth');
    } catch (error) {
      handleError(error, 'Sign Out');
      throw error;
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      log.info('Requesting password reset', 'useAuth', { email });
      
      const redirectUrl = `${window.location.origin}/auth?mode=recovery`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      log.info('Password reset email sent', 'useAuth');
    } catch (error) {
      handleError(error, 'Password Reset');
      throw error;
    }
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    try {
      log.info('Updating password', 'useAuth');
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      log.info('Password updated successfully', 'useAuth');
    } catch (error) {
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

/**
 * Enhanced Authentication Context
 * 
 * Improvements over the basic useAuth hook:
 * - Pre-loads user + role + profile in ONE request
 * - Provides loading states for each piece
 * - Caches data to prevent re-fetching
 * - Handles auth state changes properly
 * - Provides helper methods
 * 
 * This solves the problem of every page loading auth independently
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { logger } from "@/lib/logger";

export type AppRole = "stylist" | "client" | "admin";

interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  gender: string | null;
  phone: string | null;
}

interface StylistProfile {
  id: string;
  user_id: string;
  business_name: string | null;
  bio: string | null;
  color_line: string | null;
  is_available: boolean;
  // ... other stylist fields
}

interface ClientProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  // ... other client fields
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  roles: AppRole[];
  primaryRole: AppRole | null;
  stylistProfile: StylistProfile | null;
  clientProfile: ClientProfile | null;
  loading: boolean;
  initialized: boolean;
}

interface AuthContextValue extends AuthState {
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  isStylist: boolean;
  isClient: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const EnhancedAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    roles: [],
    primaryRole: null,
    stylistProfile: null,
    clientProfile: null,
    loading: true,
    initialized: false,
  });

  /**
   * Verify role consistency (defense-in-depth against state manipulation)
   */
  const verifyRoleIntegrity = useCallback(async (userId: string, currentRoles: AppRole[]): Promise<boolean> => {
    try {
      // Skip verification for regular clients to reduce database calls
      const criticalRoles = currentRoles.filter(r => r === 'admin' || r === 'stylist');
      if (criticalRoles.length === 0) return true;

      // Re-fetch critical roles only from database
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (error) {
        console.error("Role verification failed:", error);
        return false;
      }

      const verifiedRoles = (data || []).map(r => r.role as AppRole);
      
      // Check if all critical roles are still valid
      const isValid = criticalRoles.every(role => verifiedRoles.includes(role));
      
      if (!isValid) {
        console.warn("Role verification failed - forcing re-authentication");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error verifying roles:", error);
      return false;
    }
  }, []);

  /**
   * Load all auth data in ONE optimized request
   */
  const loadAuthData = useCallback(async (user: User) => {
    try {
      // Start all queries in parallel
      const [profileResult, rolesResult, stylistResult, clientResult] = await Promise.all([
        // Load profile
        supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle(),

        // Load roles
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id),

        // Load stylist profile
        supabase
          .from("stylist_profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle(),

        // Load client profile
        supabase
          .from("client_profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      const profile = profileResult.data;
      const roles = (rolesResult.data || []).map((r) => r.role as AppRole);
      const stylistProfile = stylistResult.data;
      const clientProfile = clientResult.data;

      // Determine primary role (prefer stylist if user has both)
      const primaryRole = roles.includes("stylist")
        ? "stylist"
        : roles.includes("admin")
        ? "admin"
        : roles.includes("client")
        ? "client"
        : null;

      setState({
        user,
        profile,
        roles,
        primaryRole,
        stylistProfile,
        clientProfile,
        loading: false,
        initialized: true,
      });
    } catch (error) {
      console.error("Error loading auth data:", error);
      setState((prev) => ({ ...prev, loading: false, initialized: true }));
    }
  }, []);

  /**
   * Initialize auth on mount
   */
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (session?.user) {
          await loadAuthData(session.user);
        } else {
          setState((prev) => ({ ...prev, loading: false, initialized: true }));
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (isMounted) {
          setState((prev) => ({ ...prev, loading: false, initialized: true }));
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [loadAuthData]);

  /**
   * Listen for auth state changes
   */
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        logger.debug("[Auth] State changed:", event);

        // CRITICAL: No async calls in callback - use setTimeout
        if (event === "SIGNED_IN" && session?.user) {
          // Set login timestamp for coordinating loading UI
          sessionStorage.setItem('last_login', Date.now().toString());
          
          setState(prev => ({ ...prev, loading: true }));
          setTimeout(() => {
            loadAuthData(session.user);
          }, 0);
        } else if (event === "SIGNED_OUT") {
          // Clear login coordination flags
          sessionStorage.removeItem('last_login');
          sessionStorage.removeItem('dashboard_loaded');
          
          setState({
            user: null,
            profile: null,
            roles: [],
            primaryRole: null,
            stylistProfile: null,
            clientProfile: null,
            loading: false,
            initialized: true,
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [loadAuthData]);

  /**
   * Sign out
   */
  const signOut = useCallback(async () => {
    // Clear offline queue data before signing out
    const { offlineQueue } = await import('@/lib/offlineQueue');
    offlineQueue.clearOnLogout();
    
    await supabase.auth.signOut();
    navigate("/auth");
  }, [navigate]);

  /**
   * Periodic role integrity verification (defense-in-depth)
   */
  useEffect(() => {
    if (!state.user || !state.initialized || state.roles.length === 0) return;

    // Verify role integrity every 5 minutes for critical roles
    const criticalRoles = state.roles.filter(r => r === 'admin' || r === 'stylist');
    if (criticalRoles.length === 0) return;

    const intervalId = setInterval(async () => {
      const isValid = await verifyRoleIntegrity(state.user!.id, state.roles);
      if (!isValid) {
        // Force re-authentication if role verification fails
        console.warn("Role integrity check failed - signing out for security");
        await signOut();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(intervalId);
  }, [state.user, state.initialized, state.roles, verifyRoleIntegrity, signOut]);

  /**
   * Refresh auth data (for profile updates)
   */
  const refreshAuth = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await loadAuthData(session.user);
    }
  }, [loadAuthData]);

  const value: AuthContextValue = {
    ...state,
    signOut,
    refreshAuth,
    isStylist: state.roles.includes("stylist"),
    isClient: state.roles.includes("client"),
    isAdmin: state.roles.includes("admin"),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use auth context
 */
export const useEnhancedAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useEnhancedAuth must be used within EnhancedAuthProvider");
  }
  return context;
};

/**
 * Hook to require authentication
 */
export const useRequireAuth = (requiredRole?: AppRole) => {
  const auth = useEnhancedAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.loading && auth.initialized) {
      if (!auth.user) {
        navigate("/auth");
      } else if (requiredRole && !auth.roles.includes(requiredRole)) {
        navigate("/dashboard");
      }
    }
  }, [auth.loading, auth.initialized, auth.user, auth.roles, requiredRole, navigate]);

  return auth;
};

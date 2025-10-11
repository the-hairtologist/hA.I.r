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
        console.log("[Auth] State changed:", event);

        // CRITICAL: No async calls in callback - use setTimeout
        if (event === "SIGNED_IN" && session?.user) {
          setState(prev => ({ ...prev, loading: true }));
          setTimeout(() => {
            loadAuthData(session.user);
          }, 0);
        } else if (event === "SIGNED_OUT") {
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
    await supabase.auth.signOut();
    navigate("/auth");
  }, [navigate]);

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

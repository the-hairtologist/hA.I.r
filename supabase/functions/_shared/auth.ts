/**
 * Shared Authentication & Authorization Utilities
 * Provides consistent role-based access control across all edge functions
 */

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface AuthContext {
  user: any;
  supabase: SupabaseClient;
  roles: string[];
  isStylist: boolean;
  isAdmin: boolean;
  stylistId?: string;
}

/**
 * Authenticate request and verify user has required role
 */
export async function authenticateRequest(
  req: Request,
  options: {
    requiredRole?: 'stylist' | 'admin';
    allowStylistOrAdmin?: boolean;
  } = {}
): Promise<AuthContext> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    throw new Error('Missing authorization header');
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } }
  );

  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized: Invalid or expired session');
  }

  // Get user roles
  const { data: userRoles, error: rolesError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id);

  if (rolesError) {
    throw new Error('Failed to verify user roles');
  }

  const roles = (userRoles || []).map((r: any) => r.role);
  const isStylist = roles.includes('stylist');
  const isAdmin = roles.includes('admin');

  // Check role requirements
  if (options.requiredRole === 'stylist' && !isStylist && !isAdmin) {
    throw new Error('Forbidden: Stylist role required');
  }

  if (options.requiredRole === 'admin' && !isAdmin) {
    throw new Error('Forbidden: Admin role required');
  }

  if (options.allowStylistOrAdmin && !isStylist && !isAdmin) {
    throw new Error('Forbidden: Stylist or Admin role required');
  }

  // Get stylist profile ID if user is stylist
  let stylistId: string | undefined;
  if (isStylist) {
    const { data: stylistProfile } = await supabase
      .from('stylist_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    
    stylistId = stylistProfile?.id;
  }

  return {
    user,
    supabase,
    roles,
    isStylist,
    isAdmin,
    stylistId
  };
}

/**
 * Verify user owns the resource (for stylists)
 */
export async function verifyStylistOwnsResource(
  supabase: SupabaseClient,
  userId: string,
  table: string,
  resourceId: string,
  foreignKeyColumn = 'stylist_id'
): Promise<boolean> {
  // Get stylist profile ID
  const { data: stylistProfile } = await supabase
    .from('stylist_profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (!stylistProfile) return false;

  // Check ownership
  const { data, error } = await supabase
    .from(table)
    .select('id')
    .eq('id', resourceId)
    .eq(foreignKeyColumn, stylistProfile.id)
    .maybeSingle();

  return !error && !!data;
}

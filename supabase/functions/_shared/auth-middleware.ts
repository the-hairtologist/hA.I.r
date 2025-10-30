/**
 * Server-Side Authorization Middleware
 * CRITICAL: Always validate roles on the server, never trust client
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface AuthContext {
  user: any;
  profile: any;
  supabase: any;
}

export async function requireAuth(
  req: Request
): Promise<AuthContext | Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',
  };

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'No authorization header' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Fetch profile from database
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return { user, profile, supabase };
}

export async function requireRole(
  req: Request,
  allowedRoles: string[]
): Promise<AuthContext | Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',
  };

  const authResult = await requireAuth(req);
  if (authResult instanceof Response) {
    return authResult;
  }

  const { user, supabase } = authResult;

  // Fetch roles from DATABASE (server-side validation)
  const { data: userRoles, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id);

  if (roleError) {
    console.error('Error fetching roles:', roleError);
    return new Response(
      JSON.stringify({ error: 'Failed to verify permissions' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  const roles = userRoles?.map((r: any) => r.role) || [];
  const hasPermission = roles.some((role: string) =>
    allowedRoles.includes(role)
  );

  if (!hasPermission) {
    return new Response(
      JSON.stringify({ error: 'Forbidden: Insufficient permissions' }),
      {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  return authResult;
}

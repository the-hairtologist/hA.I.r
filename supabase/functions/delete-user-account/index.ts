import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🗑️ Processing account deletion request...');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    
    if (!user) throw new Error('Unauthorized');

    console.log(`Deleting account for user: ${user.id}`);

    // Delete user data from all tables (RLS policies will prevent unauthorized deletions)
    // Due to foreign key constraints, delete in correct order:
    
    // 1. Delete appointments
    await supabase.from('appointments').delete().or(`client_id.in.(select id from client_profiles where user_id.eq.${user.id}),stylist_id.in.(select id from stylist_profiles where user_id.eq.${user.id})`);
    
    // 2. Delete formulas
    await supabase.from('formulas').delete().or(`client_id.in.(select id from client_profiles where user_id.eq.${user.id}),stylist_id.in.(select id from stylist_profiles where user_id.eq.${user.id})`);
    
    // 3. Delete services
    await supabase.from('stylist_services').delete().in('stylist_id', [
      supabase.from('stylist_profiles').select('id').eq('user_id', user.id)
    ]);
    
    // 4. Delete client and stylist profiles
    await supabase.from('client_profiles').delete().eq('user_id', user.id);
    await supabase.from('stylist_profiles').delete().eq('user_id', user.id);
    
    // 5. Delete user roles
    await supabase.from('user_roles').delete().eq('user_id', user.id);
    
    // 6. Delete profile
    await supabase.from('profiles').delete().eq('id', user.id);
    
    // 7. Delete auth user (requires service role)
    const { error: authError } = await supabase.auth.admin.deleteUser(user.id);
    
    if (authError) {
      console.error('Error deleting auth user:', authError);
      throw new Error('Failed to delete auth user');
    }

    console.log(`✅ Account deleted successfully for user: ${user.id}`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('❌ Error deleting account:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
